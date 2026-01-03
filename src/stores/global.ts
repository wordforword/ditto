import { ref, computed, type Ref } from 'vue';
import { defineStore } from 'pinia';

interface Whatever {
    text: string;
    self: number;
    group: number | null;
}

export const useGlobalStore = defineStore('global', () => {
    const spanIDs = ref([] as Ref<Whatever>[]);
    const groupsByID = ref(new Map<number, Ref<Whatever>[]>);
    const spanID = computed(() => spanIDs.value.length);
    const groupID = ref(0);
    const deletionQueue = [] as number[];
    return {
        spanIDs,
        groupsByID,
        spanID,
        groupID,
        deletionQueue,
        clear(group: number) {
            deletionQueue.push(group);
        },
        addSpan(text: string) {
            const obj = ref({ text, self: spanID.value, group: null });
            spanIDs.value.push(obj);
            return obj;
        },
        finalizeGroup() {
            groupsByID.value.set(groupID.value, []);
            for (let i = spanID.value - 1; i >= 0; i--) {
                const span = (spanIDs.value[i])!;
                if (span.value.group !== null) {
                    break;
                }
                span.value.group = groupID.value;
                groupsByID.value.get(groupID.value)!.push(span);
            }
            groupID.value++;
        }
    }
});
