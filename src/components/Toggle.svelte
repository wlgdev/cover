<script module>
  let input_toggle_counter = 0;
</script>

<script lang="ts">
  type Props = {
    label: string;
    checked: boolean;
    style?: string;
  }

  let { label = "", checked = $bindable(false), style }: Props = $props();

  let id = "input_toggle_" + input_toggle_counter++;
</script>

<div class="container" {style}>
  <div class="label">{label}</div>
  <div class="switch">
    <input {id} type="checkbox" bind:checked />
    <label for={id}></label>
  </div>
</div>

<style>
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .switch {
    display: inline-block;
  }
  .switch input {
    display: none;
  }

  .switch label {
    display: block;
    width: 30px;
    height: 14px;
    padding: 2px;
    border-radius: 15px;
    cursor: pointer;
    transition: 0.3s;
    background: var(--bg-light-extra);
  }

  .switch label::after {
    content: "";
    display: inherit;
    width: 14px;
    height: 14px;
    border-radius: 12px;
    background: var(--bg-dark);
    transition: 0.3s;
  }

  .switch input:checked ~ label::after {
    translate: 15px 0;
    background: var(--bg-dark);
  }

  .switch input:checked ~ label {
    background: var(--violet);
  }

  .switch input:disabled ~ label {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .label {
    font-size: smaller;
    color: var(--text-2);
  }
</style>
