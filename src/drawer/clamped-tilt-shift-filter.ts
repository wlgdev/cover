import { Filter, GlProgram, GpuProgram } from "pixi.js";

type Axis = "horizontal" | "vertical";

type Point = {
  x: number;
  y: number;
};

type ClampedTiltShiftOptions = {
  blur: number;
  gradientBlur?: number;
  start: Point;
  end: Point;
};

type ClampedTiltShiftAxisOptions = ClampedTiltShiftOptions & {
  axis: Axis;
};

const DEFAULT_FILTER_VERTEX = `in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition(void)
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;

    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(void)
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}`;

const DEFAULT_FILTER_WGSL = `struct GlobalFilterUniforms {
  uInputSize: vec4<f32>,
  uInputPixel: vec4<f32>,
  uInputClamp: vec4<f32>,
  uOutputFrame: vec4<f32>,
  uGlobalFrame: vec4<f32>,
  uOutputTexture: vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler: sampler;

struct VSOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>
};

fn filterVertexPosition(aPosition: vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord(aPosition: vec2<f32>) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

@vertex
fn mainVertex(@location(0) aPosition: vec2<f32>) -> VSOutput {
  return VSOutput(
    filterVertexPosition(aPosition),
    filterTextureCoord(aPosition)
  );
}`;

const CLAMPED_TILT_SHIFT_GL = `precision highp float;
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform vec2 uBlur;
uniform vec2 uStart;
uniform vec2 uEnd;
uniform vec2 uDelta;
uniform vec4 uInputSize;
uniform vec4 uInputClamp;

float random(vec3 scale, float seed)
{
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main(void)
{
    vec4 color = vec4(0.0);
    float total = 0.0;

    float blur = uBlur.x;
    float gradientBlur = uBlur.y;

    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
    vec2 normal = normalize(vec2(uStart.y - uEnd.y, uEnd.x - uStart.x));
    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * uInputSize.xy - uStart, normal)) / gradientBlur) * blur;

    for (float t = -30.0; t <= 30.0; t++)
    {
        float percent = (t + offset - 0.5) / 30.0;
        float weight = 1.0 - abs(percent);
        vec2 sampleCoord = clamp(vTextureCoord + uDelta / uInputSize.xy * percent * radius, uInputClamp.xy, uInputClamp.zw);
        vec4 sample = texture(uTexture, sampleCoord);
        sample.rgb *= sample.a;
        color += sample * weight;
        total += weight;
    }

    color /= total;
    color.rgb /= color.a + 0.00001;

    finalColor = color;
}`;

const CLAMPED_TILT_SHIFT_WGSL = `${DEFAULT_FILTER_WGSL}

struct TiltShiftUniforms {
  uBlur: vec2<f32>,
  uStart: vec2<f32>,
  uEnd: vec2<f32>,
  uDelta: vec2<f32>,
};

@group(1) @binding(0) var<uniform> tiltShiftUniforms: TiltShiftUniforms;

fn random(position: vec4<f32>, scale: vec3<f32>, seed: f32) -> f32
{
  return fract(sin(dot(position.xyz + seed, scale)) * 43758.5453 + seed);
}

@fragment
fn mainFragment(
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>
) -> @location(0) vec4<f32> {
  let blur = tiltShiftUniforms.uBlur.x;
  let gradientBlur = tiltShiftUniforms.uBlur.y;
  let start = tiltShiftUniforms.uStart;
  let end = tiltShiftUniforms.uEnd;
  let delta = tiltShiftUniforms.uDelta;

  var color: vec4<f32> = vec4<f32>(0.0);
  var total: f32 = 0.0;

  let offset = random(position, vec3<f32>(12.9898, 78.233, 151.7182), 0.0);
  let normal = normalize(vec2<f32>(start.y - end.y, end.x - start.x));
  let radius = smoothstep(0.0, 1.0, abs(dot(uv * gfu.uInputSize.xy - start, normal)) / gradientBlur) * blur;

  for (var t: f32 = -30.0; t <= 30.0; t += 1.0)
  {
    let percent = (t + offset - 0.5) / 30.0;
    let weight = 1.0 - abs(percent);
    let sampleCoord = clamp(uv + delta / gfu.uInputSize.xy * percent * radius, gfu.uInputClamp.xy, gfu.uInputClamp.zw);
    var sample = textureSample(uTexture, uSampler, sampleCoord);
    sample = vec4<f32>(sample.rgb * sample.a, sample.a);
    color += sample * weight;
    total += weight;
  }

  color /= total;
  return vec4<f32>(color.rgb / (color.a + 0.00001), color.a);
}`;

class ClampedTiltShiftAxisFilter extends Filter {
  private uniforms;

  constructor(options: ClampedTiltShiftAxisOptions) {
    const gpuProgram = GpuProgram.from({
      vertex: { source: CLAMPED_TILT_SHIFT_WGSL, entryPoint: "mainVertex" },
      fragment: { source: CLAMPED_TILT_SHIFT_WGSL, entryPoint: "mainFragment" },
      name: "clamped-tilt-shift-axis-filter",
    });
    const glProgram = GlProgram.from({
      vertex: DEFAULT_FILTER_VERTEX,
      fragment: CLAMPED_TILT_SHIFT_GL,
      name: "clamped-tilt-shift-axis-filter",
    });
    const gradientBlur = options.gradientBlur ?? 600;

    super({
      gpuProgram,
      glProgram,
      resources: {
        tiltShiftUniforms: {
          uBlur: { value: new Float32Array([options.blur, gradientBlur]), type: "vec2<f32>" },
          uStart: { value: options.start, type: "vec2<f32>" },
          uEnd: { value: options.end, type: "vec2<f32>" },
          uDelta: { value: new Float32Array([0, 0]), type: "vec2<f32>" },
        },
      },
    });

    this.uniforms = this.resources.tiltShiftUniforms.uniforms;
    this.updateDelta(options.axis);
  }

  private updateDelta(axis: Axis) {
    this.uniforms.uDelta[0] = 0;
    this.uniforms.uDelta[1] = 0;

    const end = this.uniforms.uEnd;
    const start = this.uniforms.uStart;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (!Number.isFinite(length) || length === 0) {
      return;
    }

    const vertical = axis === "vertical";
    this.uniforms.uDelta[0] = vertical ? -dy / length : dx / length;
    this.uniforms.uDelta[1] = vertical ? dx / length : dy / length;
  }
}

export function createClampedTiltShiftFilters(options: ClampedTiltShiftOptions): Filter[] {
  return [
    new ClampedTiltShiftAxisFilter({ ...options, axis: "horizontal" }),
    new ClampedTiltShiftAxisFilter({ ...options, axis: "vertical" }),
  ];
}
