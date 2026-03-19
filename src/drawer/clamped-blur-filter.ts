import { Filter, GlProgram, GpuProgram } from "pixi.js";

type Axis = "horizontal" | "vertical";

type ClampedBlurAxisOptions = {
  strength: number;
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

const CLAMPED_BLUR_GL = `precision highp float;
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uStrength;
uniform vec2 uDelta;
uniform vec4 uInputSize;
uniform vec4 uInputClamp;

void main(void)
{
    vec4 color = vec4(0.0);
    float total = 0.0;

    for (float t = -30.0; t <= 30.0; t++)
    {
        float percent = t / 30.0;
        float weight = 1.0 - abs(percent);
        vec2 sampleCoord = clamp(vTextureCoord + uDelta / uInputSize.xy * percent * uStrength, uInputClamp.xy, uInputClamp.zw);
        vec4 sample = texture(uTexture, sampleCoord);
        sample.rgb *= sample.a;
        color += sample * weight;
        total += weight;
    }

    color /= total;
    color.rgb /= color.a + 0.00001;

    finalColor = color;
}`;

const CLAMPED_BLUR_WGSL = `${DEFAULT_FILTER_WGSL}

struct BlurUniforms {
  uStrength: f32,
  uDelta: vec2<f32>,
};

@group(1) @binding(0) var<uniform> blurUniforms: BlurUniforms;

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>
) -> @location(0) vec4<f32> {
  let strength = blurUniforms.uStrength;
  let delta = blurUniforms.uDelta;

  var color: vec4<f32> = vec4<f32>(0.0);
  var total: f32 = 0.0;

  for (var t: f32 = -30.0; t <= 30.0; t += 1.0)
  {
    let percent = t / 30.0;
    let weight = 1.0 - abs(percent);
    let sampleCoord = clamp(uv + delta / gfu.uInputSize.xy * percent * strength, gfu.uInputClamp.xy, gfu.uInputClamp.zw);
    var sample = textureSample(uTexture, uSampler, sampleCoord);
    sample = vec4<f32>(sample.rgb * sample.a, sample.a);
    color += sample * weight;
    total += weight;
  }

  color /= total;
  return vec4<f32>(color.rgb / (color.a + 0.00001), color.a);
}`;

class ClampedBlurAxisFilter extends Filter {
  constructor(options: ClampedBlurAxisOptions) {
    const gpuProgram = GpuProgram.from({
      vertex: { source: CLAMPED_BLUR_WGSL, entryPoint: "mainVertex" },
      fragment: { source: CLAMPED_BLUR_WGSL, entryPoint: "mainFragment" },
      name: "clamped-blur-axis-filter",
    });
    const glProgram = GlProgram.from({
      vertex: DEFAULT_FILTER_VERTEX,
      fragment: CLAMPED_BLUR_GL,
      name: "clamped-blur-axis-filter",
    });

    const delta = options.axis === "horizontal" ? new Float32Array([1, 0]) : new Float32Array([0, 1]);

    super({
      gpuProgram,
      glProgram,
      resources: {
        blurUniforms: {
          uStrength: { value: options.strength, type: "f32" },
          uDelta: { value: delta, type: "vec2<f32>" },
        },
      },
    });
  }
}

export function createClampedBlurFilters(strength: number): Filter[] {
  return [
    new ClampedBlurAxisFilter({ strength, axis: "horizontal" }),
    new ClampedBlurAxisFilter({ strength, axis: "vertical" }),
  ];
}
