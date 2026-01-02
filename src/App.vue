<template>
<div>
  <Side v-for="selection in selections" :data="selection"></Side>
</div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import Side from './components/Side.vue';

const selections = reactive([[], []]);
</script>

<style scoped>
div {
  width: 100vw;
  height: 100vh;
  display: flex;
}
</style>
