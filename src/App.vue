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

const store = useGlobalStore();
const keys = useMagicKeys();
whenever(keys.space!, () => {
  console.log('hi')
  store.finalizeGroup();
});

</script>

<style scoped>
div {
  width: 100vw;
  height: 100vh;
  display: flex;
}
</style>
