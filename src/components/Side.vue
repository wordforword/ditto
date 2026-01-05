<template>
  <div>
    <button @click="copyAll">📋</button>
    <article v-if="hideInput">
      <Paragraph ref="dom-paras" v-for="paragraph, i in inputParagraphs" :parent-index="i"
        @finalize="runs => finalize(runs, i)" :text="paragraph"></Paragraph>
    </article>
    <textarea v-else @paste="handleInitialPaste"></textarea>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, type Ref } from 'vue';
import Paragraph from './Paragraph.vue';
import type { Finalized } from '../types';

const inputParagraphs: Ref<string[]> = ref([]);
const numParagraphs = computed(() => inputParagraphs.value.length)
const hideInput = computed(() => numParagraphs.value !== 0);
const domParagraphs = useTemplateRef(`dom-paras`);
const emit = defineEmits<{
  copy: [index: number | null]
}>();
defineExpose({ requestParagraph, numParagraphs });

function handleInitialPaste(c: ClipboardEvent) {
  if (!(c.target instanceof Element)) {
    return;
  }
  const content = c.clipboardData?.getData(`text/plain`) ?? ``;
  inputParagraphs.value = content.replace(/\r\n/g, `\n`).split(`\n\n`);
}

function finalize(_nodes: Finalized[], i: number) {
  // todo remove _nodes i guess, parent doesn't need it
  emit(`copy`, i);
}

function requestParagraph(i: number) {
  if (domParagraphs.value === null) {
    return [];
  }
  let para = domParagraphs.value[i];
  if ((para?.parentIndex ?? i) !== i) {
    console.log(`had to do linear search for paragraph`, i)
    para = domParagraphs.value?.find(p => p?.parentIndex === i);
  }
  if (para === null || para === undefined) {
    console.log(`no paragraph`, i);
    return [];
  }
  return para.finalize();
}

function copyAll() {
  emit(`copy`, null);
}
</script>

<style scoped>
.invisible {
  display: none;
}

div {
  flex: 1;
}

article,
textarea {
  width: 100%;
  height: 100%;
  font-family: 'Gentium', 'Brill', monospace;
  font-style: italic;
  text-align: left;
  /* for fuckass button */
  margin-top: 2.5em;
}

.read-the-docs {
  color: #888;
}

button {
  /* idk man */
  width: 50%;
  position: absolute;
  height: 2em;
  margin: 2px;
  border: 1px solid gray;
}
</style>
