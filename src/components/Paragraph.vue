<template>
  <p ref="p">
    <template v-for="{ type, text: t, id, initGroups }, i in excerpts" :key="id">
      <Span @selection="handleSelection(i)" @clear="clear(i)" :type="type" :text="t" :init-groups="initGroups"></Span>
    </template>
    <button id="copy" @click="copy"></button>
    <button id="edit" @click="edit"></button>
  </p>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, type Ref } from 'vue';
import Span from './Span.vue';
import type { Finalized } from '../types';
import { useGlobalStore } from '../stores/global';

interface Excerpt {
  type: `span` | `text`;
  text: string;
  id: number;
  initGroups: number[];
}

const store = useGlobalStore();
defineExpose({ finalize });
const props = defineProps<{ text: string, parentIndex: number }>();
const emit = defineEmits<{
  finalize: [nodes: Finalized[]]
}>();
const p = useTemplateRef(`p`);

let keyCounter = 0;
const excerpts: Ref<Excerpt[]> = ref(initialize(props.text));

function initialize(text: string): Excerpt[] {
  const ret: Excerpt[] = [];
  const pattern = new RegExp(`${store.escOpen}([\\d${store.escDelim}]+?)${store.escClose}`, `g`);
  let current = 0;
  let initGroups: number[] = [];
  for (const match of text.matchAll(pattern)) {
    console.log(match);
    ret.push({
      type: initGroups.length ? `span` : `text`,
      text: text.slice(current, match.index),
      id: keyCounter++,
      initGroups,
    });
    initGroups = match[1]!.split(`,`).map(n => +n);
    current = match.index + match[0].length;
  }
  ret.push({
    type: initGroups.length ? `span` : `text`,
    text: text.slice(current),
    id: keyCounter++,
    initGroups,
  })
  return ret;
}

function handleSelection(index: number) {
  const sel = window.getSelection();
  if (!sel || !sel.focusNode || !sel.anchorNode) {
    console.log(sel, sel?.focusNode, sel?.anchorNode);
    return;
  }
  if (sel.direction === `backward`) {
    sel.setBaseAndExtent(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset);
  }
  if (sel.anchorNode !== sel.focusNode) {
    sel.empty();
    return;
  }
  if (sel.isCollapsed) {
    const originalAnchorNode = sel.anchorNode;
    sel.modify(`move`, `forward`, `character`);
    sel.modify(`move`, `backward`, `word`);
    sel.modify(`extend`, `forward`, `word`);
    if (sel.anchorNode !== sel.focusNode || sel.anchorNode !== originalAnchorNode) {
      if (sel.anchorNode === null) {
        console.log(`error: anchornode null oops!`);
      }
      sel.setBaseAndExtent(originalAnchorNode, 0, originalAnchorNode, originalAnchorNode.textContent?.length ?? 0);
    }
  }
  while (/\s$/.test(sel.toString())) {
    sel.modify(`extend`, `backward`, `character`);
  }
  const text = excerpts.value[index]!.text;
  excerpts.value.splice(index, 1,
    { type: `text`, text: text.slice(0, sel.anchorOffset), id: keyCounter++, initGroups: [] },
    { type: `span`, text: text.slice(sel.anchorOffset, sel.focusOffset), id: keyCounter++, initGroups: [] },
    { type: `text`, text: text.slice(sel.focusOffset), id: keyCounter++, initGroups: [] },
  );
}

function clear(index: number) {
  // only called from type=span not type=text
  const backwards = excerpts.value[index - 1]?.type === `text`;
  const forwards = excerpts.value[index + 1]?.type === `text`;
  const backwardsText = backwards ? excerpts.value[index - 1]?.text : ``;
  const forwardsText = forwards ? excerpts.value[index + 1]?.text : ``;
  excerpts.value.splice(
    index - (+backwards),
    1 + (+backwards) + (+forwards),
    {
      type: `text`,
      text: backwardsText + (excerpts.value[index]?.text ?? ``) + forwardsText,
      id: keyCounter++,
      initGroups: [],
    })
}


function finalize(): Finalized[] {
  // i feel like i should be doing this thru vue but that felt even hackier
  const ret = [];
  for (const node of p.value?.childNodes ?? []) {
    const groups = node instanceof HTMLElement && node.title ? node.title.split(`,`).map(g => +g) : null;
    ret.push({ groups, text: node.textContent ?? `` });
  }
  return ret;
}

function copy() {
  emit(`finalize`, finalize());
}

function edit() { }

</script>

<style scoped>
button {
  padding: 3px;
  margin: 2px;
  border: 1px solid gray;
}

#copy::after {
  content: "📋";
}

#edit::after {
  content: "✏️";
}
</style>