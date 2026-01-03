<template>
  <p @mouseup="handle">
    <slot></slot>
  </p>
</template>

<script setup lang="ts">
import { render, h } from 'vue';
import Span from './Span.vue';

function handle(e: MouseEvent) {
  const sel = window.getSelection();
  if (!sel) {
    return;
  }
  if ((e.target as HTMLElement).tagName !== `P`) {
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
  const text = sel.toString();
  const span = document.createElement(`span`);
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const spanComponent = h(Span, { text });
  render(spanComponent, span);
  range.insertNode(span);
  // think this has to go after the range.insertNode() on top of this comment
  span.replaceWith(span.firstChild!);
  sel.empty();
}
</script>

<style scoped></style>