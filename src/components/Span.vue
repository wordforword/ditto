<template>
    <template v-if="!editing">
        <span v-if="type === `span`" class="final" @click.left="doGroupNumber" @click.right.prevent="clear"
            @click.ctrl="editing = true" :title="title"
            :style="{ color, textDecoration: `underline`, userSelect: `none` }">
            {{ ownText }}
        </span>
        <span v-else @mouseup.left.prevent="$emit('selection')" @click.ctrl="editing = true">
            {{ ownText }}
        </span>
    </template>
    <textarea v-else v-model="ownText" @keydown.enter.prevent="editing = false" @blur="editing = false"></textarea>
</template>

<script setup lang="ts">
import { computed, ref, type Ref } from 'vue';
import { useGlobalStore } from '../stores/global';

const props = defineProps<{ type: `text` | `span`, text: string, initGroups: number[] }>();
const _ownText: Ref<string | null> = ref(null);
const ownText = computed({
    get: () => _ownText.value ?? props.text,
    set: v => { _ownText.value = v; },
});
let editing: Ref<boolean> = ref(false);
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

</script>

<style scoped>
textarea {
    width: 100%;
    height: 100%;
    font-family: 'Gentium', 'Brill', monospace;
    font-style: italic;
    text-align: left;
    /* for fuckass button */
    margin-top: 2.5em;
}
</style>