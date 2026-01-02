<template>
<div>
  <article v-if="hideInput">
    <Paragraph v-for="paragraph in paragraphs">{{ paragraph }}</Paragraph>
  </article>
  <textarea v-else @paste="handle"></textarea>
</div>
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from 'vue';

import Paragraph from './Paragraph.vue';

const paragraphs: Ref<string[]> = ref([]);
const hideInput = computed(() => !!paragraphs.value.length);

function handle(c: ClipboardEvent) {
  if (!(c.target instanceof Element)) {
    return;
  }
  const content = c.clipboardData?.getData(`text/plain`) ?? ``;
  paragraphs.value = content.replace(/\r\n/g, `\n`).split(`\n\n`);
}
</script>

<style scoped>
.invisible {
  display: none;
}

div {
  flex: 1;
}

article, textarea {
  width: 100%;
  height: 100%;
  font-family: monospace;
}

.read-the-docs {
  color: #888;
}
</style>
