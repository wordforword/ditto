<template>
    <span v-if="store.savedGroupNumber !== null" :style="{ left: `${mouseX}px`, top: `${mouseY}px` }">
        {{ store.savedGroupNumber }}
    </span>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGlobalStore } from '../stores/global';

const store = useGlobalStore();

let mouseX = ref(0);
let mouseY = ref(0);

document.addEventListener(
    `mousemove`,
    e => {
        mouseX.value = e.clientX;
        mouseY.value = e.clientY;
        console.log(e.clientX, e.clientY, mouseX.value, mouseY.value)
    }
);

</script>

<style scoped>
span {
    position: absolute;
    pointer-events: none;
    transform: translate(10px, 10px);
}
</style>