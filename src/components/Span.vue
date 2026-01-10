<template>
    <span v-if="type === `span`" class="final" @click.left="doGroupNumber" @click.right.prevent="clear"
        @click.middle.prevent="edit" :title="title" :style="{ color, textDecoration: `underline`, userSelect: `none` }">
        {{ ownText }}
    </span>
    <span v-else @mouseup.left.prevent="$emit('selection')" @click.right.prevent="edit">
        {{ ownText }}
    </span>
</template>

<script setup lang="ts">
import { computed, ref, type Ref } from 'vue';
import { useGlobalStore } from '../stores/global';

const props = defineProps<{ type: `text` | `span`, text: string, initGroups: number[] }>();
const _ownText: Ref<string | null> = ref(null);
const ownText = computed(() => _ownText.value ?? props.text)
const emit = defineEmits([`clear`, `selection`])

const store = useGlobalStore();
let data: ReturnType<typeof store.addSpan> | null = null;
if (props.type === `span`) {
    data = store.addSpan(props.text, props.initGroups);
}
const color = computed(() => {
    if (data === null || data.value.groups.length === 0) {
        return `#000`;
    }
    const grp = data.value.groups[0]!;
    return `rgb(${(grp * 59) % 256}, ${(grp * 23) % 256}, ${(grp * 37) % 256})`;
});
const title = computed(() => {
    if (data === null) {
        return undefined;
    }
    return [...data.value.groups].sort((a, b) => b - a).join(`,`);
});

function doGroupNumber() {
    if (data === null) {
        return;
    }
    if (store.savedGroupNumbers.length === 0) {
        store.savedGroupNumbers = data.value.groups;
        store.savedGroupNumberIdx = 0;
    }
    else if (store.savedGroupNumbers === data.value.groups) {
        store.savedGroupNumberIdx = (store.savedGroupNumberIdx + 1) % store.savedGroupNumbers.length;
    } else {
        const n = store.savedGroupNumbers[store.savedGroupNumberIdx];
        if (n !== undefined) {
            data.value.groups.push(n);
        }
        store.savedGroupNumbers = [];
    }
}

function clear() {
    store.clearSpan(data);
    emit(`clear`);
}

function edit() {
    _ownText.value = window.prompt(ownText.value) || _ownText.value;
}

</script>

<style scoped></style>