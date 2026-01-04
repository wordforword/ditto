<template>
    <span v-if="type === `span`" class="final" @click.left="doGroupNumber" @click.right.prevent="clear"
        :title="dumbToString(data?.group ?? undefined)"
        :style="{ color, textDecoration: `underline`, userSelect: `none` }">
        {{ props.text }}
    </span>
    <span v-else @mouseup.left.prevent="$emit('selection')">
        {{ props.text }}
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGlobalStore } from '../stores/global';

const props = defineProps<{ type: `text` | `span`, text: string }>();
const emit = defineEmits([`clear`, `selection`])

const store = useGlobalStore();
let data: ReturnType<typeof store.addSpan> | null = null;
if (props.type === `span`) {
    data = store.addSpan(props.text);
}
const color = computed(() => {
    if ((data?.value.group ?? null) === null) {
        return `#000`;
    }
    const grp = data!.value.group!;
    return `rgb(${(grp * 59) % 256}, ${(grp * 23) % 256}, ${(grp * 37) % 256})`;
});

function dumbToString(s: number | undefined) {
    if (s === undefined) {
        return s;
    }
    return `${s}`;
}

function doGroupNumber() {
    if (data === null) {
        return;
    }
    if (store.savedGroupNumber === null) {
        store.savedGroupNumber = data.value.group;
    } else {
        data.value.group = store.savedGroupNumber;
        store.savedGroupNumber = null;
    }
}

function clear() {
    store.clearSpan(data);
    emit(`clear`);
}

</script>

<style scoped></style>