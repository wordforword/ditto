import { ref, computed, type Ref } from 'vue';
import { defineStore } from 'pinia';

interface Whatever {
    text: string;
    self: number;
    group: number | null;
}

export const useGlobalStore = defineStore('global', () => {
    const spanIDs = ref([] as Ref<Whatever>[]);
    const groupsByID = ref(new Map<number, Set<Ref<Whatever>>>);
    const spanID = computed(() => spanIDs.value.length);
    const groupID = ref(0);
    const savedGroupNumber: Ref<number | null> = ref(null);

    return {
        spanIDs,
        groupsByID,
        spanID,
        groupID,
        savedGroupNumber,
        addSpan(text: string): Ref<Whatever> {
            const obj = ref({ text, self: spanID.value, group: null });
            spanIDs.value.push(obj);
            return obj;
        },
        finalizeGroup() {
            groupsByID.value.set(groupID.value, new Set());
            for (let i = spanID.value - 1; i >= 0; i--) {
                const span = (spanIDs.value[i])!;
                if (span.value.group !== null) {
                    break;
                }
                span.value.group = groupID.value;
                groupsByID.value.get(groupID.value)!.add(span);
            }
            groupID.value++;
        },
        clearSpan(data: Ref<Whatever> | null) {
            if (data === null || data.value.group === null) {
                return;
            }
            groupsByID.value.get(data.value.group)?.delete(data);
            data.value.group = null;
        },
    }
});
