<template>
  <div>
    <button @click="copyAll">📋</button>
    <article v-if="hideInput">
      <Paragraph ref="dom-paras" v-for="paragraph in inputParagraphs" :text="paragraph"></Paragraph>
    </article>
    <textarea v-else @paste="handleInitialPaste"></textarea>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, type Ref } from 'vue';

import Paragraph from './Paragraph.vue';

const inputParagraphs: Ref<string[]> = ref([]);
const hideInput = computed(() => !!inputParagraphs.value.length);
const domParagraphs = useTemplateRef(`dom-paras`);

function handleInitialPaste(c: ClipboardEvent) {
  if (!(c.target instanceof Element)) {
    return;
  }
  const content = c.clipboardData?.getData(`text/plain`) ?? ``;
  inputParagraphs.value = content.replace(/\r\n/g, `\n`).split(`\n\n`);
}

function copyAll() {
  navigator.clipboard.writeText(domParagraphs.value?.map(p => p?.finalize()).join(``) ?? ``);
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
