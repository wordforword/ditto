<template>
<p @mouseup="handle">
  <slot></slot>
</p>
</template>

<script setup lang="ts">
const props = defineProps<{data: HTMLElement[]}>();

function handle(e: MouseEvent) {
  const sel = window.getSelection();
  if (!sel) {
    return;
  }
  if ((e.target as HTMLElement).tagName !== `P`) {
    console.log(e.target);
    return;
  }
  if (sel.isCollapsed) {
    sel.modify(`move`, `forward`, `character`);
    sel.modify(`move`, `backward`, `word`);
    sel.modify(`extend`, `forward`, `word`);
  }
  while (/\s$/.test(sel.toString())) {
    sel.modify(`extend`, `backward`, `character`);
  }
  const s = sel.toString();
  const span = document.createElement(`span`);
  span.textContent = s;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(range.createContextualFragment(`<span style='text-decoration:underline;user-select:none;pointer-events:none'>${s}</span>`));
  sel.empty();

  props.data.push(span);
}
</script>

<style scoped>

</style>