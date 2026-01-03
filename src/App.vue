<template>
  <div>
    <Side></Side>
    <Side></Side>
  </div>
</template>

<script setup lang="ts">
import { whenever, useMagicKeys } from '@vueuse/core';
import Side from './components/Side.vue';
import { useGlobalStore } from './stores/global';
import { watch } from 'vue';

const store = useGlobalStore();
const keys = useMagicKeys();
whenever(keys.space!, () => {
  console.log('hi')
  store.finalizeGroup();
});

watch(() => store.deletionQueue, v => {
  for (const id of v) {
    for (const span of store.groupsByID.get(id) ?? []) {
      span.value.group = null;
    }
  }
});

</script>

<style scoped>
div {
  width: 100vw;
  height: 100vh;
  display: flex;
}
</style>
