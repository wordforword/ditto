<template>
<div>
  <Side v-for="selection in selections" :data="selection"></Side>
</div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { whenever, useMagicKeys } from '@vueuse/core';
import Side from './components/Side.vue';

const selections = reactive([[] as HTMLElement[], [] as HTMLElement[]]);
const counter = ref(0);

const allSpans = new Map<number, HTMLElement[]>();

const keys = useMagicKeys();
whenever(keys.space!, () => {
  if (selections.every(a => a.length === 0)) {
    return;
  }
  selections.forEach(spans => {
    spans.forEach(span => {
      span.id = `${counter.value}`;
      if (!allSpans.has(counter.value)) {
        allSpans.set(counter.value, []);
      }
      allSpans.get(counter.value)!.push(span);
      console.log(allSpans)
    });
    spans.length = 0;
  });
  counter.value++;
})
</script>

<style scoped>
div {
  width: 100vw;
  height: 100vh;
  display: flex;
}
</style>
