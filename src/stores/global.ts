import { ref, computed, type Ref } from 'vue';
import { defineStore } from 'pinia';

interface Whatever {
    text: string;
    self: number;
    group: number | null;
}

export const useGlobalStore = defineStore('global', () => {
    const spanIDs = ref([] as Ref<Whatever>[]);
    const spanID = computed(() => spanIDs.value.length);
    const groupID = ref(0);
    return {
        spanIDs,
        spanID,
        groupID,
        addSpan(text: string) {
            const obj = ref({ text, self: spanID.value, group: null });
            spanIDs.value.push(obj);
            return obj;
        },
        finalizeGroup() {
            console.log(spanIDs);
            for (let i = spanID.value - 1; i >= 0; i--) {
                const span = spanIDs.value[i];
                if (span!.value.group === null) {
                    span!.value.group = groupID.value;
                }
            }
            groupID.value++;
        }
    }
});
