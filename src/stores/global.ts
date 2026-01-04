import { ref, computed, type Ref } from 'vue';
import { defineStore } from 'pinia';

interface Whatever {
    text: string;
    self: number;
    groups: number[];
}

export const useGlobalStore = defineStore('global', () => {
    const spanIDs = ref([] as Ref<Whatever>[]);
    const groupsByID = ref(new Map<number, Set<Ref<Whatever>>>);
    const spanID = computed(() => spanIDs.value.length);
    const groupID = ref(0);
    const savedGroupNumbers: Ref<number[]> = ref([]);
    const savedGroupNumberIdx: Ref<number> = ref(0);

    return {
        spanIDs,
        groupsByID,
        spanID,
        groupID,
        savedGroupNumbers,
        savedGroupNumberIdx,
        addSpan(text: string): Ref<Whatever> {
            const obj = ref({ text, self: spanID.value, groups: [] });
            spanIDs.value.push(obj);
            return obj;
        },
        finalizeGroup() {
            groupsByID.value.set(groupID.value, new Set());
            for (let i = spanID.value - 1; i >= 0; i--) {
                const span = (spanIDs.value[i])!;
                if (span.value.groups.length !== 0) {
                    break;
                }
                span.value.groups.push(groupID.value);
                groupsByID.value.get(groupID.value)!.add(span);
            }
            groupID.value++;
        },
        clearSpan(data: Ref<Whatever> | null) {
            if (data === null || data.value.groups.length === 0) {
                return;
            }
            data.value.groups.forEach(g => groupsByID.value.get(g)?.delete(data));
            data.value.groups = [];
        },
    }
});
