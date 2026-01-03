<template>
    <span :style="{ color, textDecoration: `underline`, pointerEvents: `none`, userSelect: `none` }">
        <span v-if="data.group !== null" class="number">{{ data.group }}</span>
        {{ props.text }}
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGlobalStore } from '../stores/global';

const props = defineProps<{ text: string }>();

const store = useGlobalStore();
const data = store.addSpan(props.text);
const color = computed(() => {
    const group = data.value.group;
    if (group === null) {
        return `#000`;
    }
    return `rgb(${(group * 59) % 256}, ${(group * 23) % 256}, ${(group * 37) % 256})`;
});

</script>

<style></style>