<template>
  <p @mouseup="handle">
    <template v-for="{ text: t, type } in excerpts">
      <Span v-if="type === `span`" :text="t"></Span>
      <template v-else>{{ t }}</template>
    </template>
  </p>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import Span from './Span.vue';

interface Excerpt {
  type: `span` | `text`;
  text: string;
  node?: Node
}

const props = defineProps<{ text: string }>();

const excerpts: Ref<Excerpt[]> = ref([
  {
    type: `text`,
    text: props.text,
  }
]);

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
  const surroundingText = sel.anchorNode?.textContent;
  if (!surroundingText) {
    return;
  }
  const beginning = surroundingText.slice(0, sel.anchorOffset);
  const ending = surroundingText.slice(sel.focusOffset);
  const newExcerpts = [] as Excerpt[];
  for (const node of sel.anchorNode.parentElement?.childNodes ?? []) {
    if (node === sel.anchorNode) {
      newExcerpts.push(
        { type: `text`, text: beginning },
        { type: `span`, text: sel.toString() },
        { type: `text`, text: ending },
      );
      continue;
    }
    newExcerpts.push({
      type: node instanceof HTMLSpanElement ? `span` : `text`,
      text: node.textContent ?? ``,
    });
  }
  excerpts.value = newExcerpts;
  sel.empty();
}
</script>

<style scoped></style>