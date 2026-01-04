<template>
  <p ref="p">
    <template v-for="{ type, text: t, id }, i in excerpts" :key="id">
      <Span @selection="handleSelection(i)" @clear="clear(i)" :type="type" :text="t"></Span>
    </template>
    <button id="copy" @click="copy"></button>
  </p>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, type Ref } from 'vue';
import Span from './Span.vue';

interface Excerpt {
  type: `span` | `text`;
  text: string;
  id: number;
}

const props = defineProps<{ text: string }>();
defineExpose({ finalize });
const p = useTemplateRef(`p`);

let keyCounter = 0;
const excerpts: Ref<Excerpt[]> = ref([
  {
    type: `text`,
    text: props.text,
    id: keyCounter++,
  }
]);

function handleSelection(index: number) {
  const sel = window.getSelection();
  if (!sel || !sel.focusNode || !sel.anchorNode) {
    console.log(sel, sel?.focusNode, sel?.anchorNode);
    return;
  }
  if (sel.direction === `backward`) {
    sel.setBaseAndExtent(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset);
  }
  if (sel.anchorNode !== sel.focusNode) {
    sel.empty();
    return;
  }
  if (sel.isCollapsed) {
    const originalAnchorNode = sel.anchorNode;
    sel.modify(`move`, `forward`, `character`);
    sel.modify(`move`, `backward`, `word`);
    sel.modify(`extend`, `forward`, `word`);
    if (sel.anchorNode !== sel.focusNode || sel.anchorNode !== originalAnchorNode) {
      if (sel.anchorNode === null) {
        console.log(`error: anchornode null oops!`);
      }
      sel.setBaseAndExtent(originalAnchorNode, 0, originalAnchorNode, originalAnchorNode.textContent?.length ?? 0);
    }
  }
  while (/\s$/.test(sel.toString())) {
    sel.modify(`extend`, `backward`, `character`);
  }
  const text = excerpts.value[index]!.text;
  excerpts.value.splice(index, 1,
    { type: `text`, text: text.slice(0, sel.anchorOffset), id: keyCounter++ },
    { type: `span`, text: text.slice(sel.anchorOffset, sel.focusOffset), id: keyCounter++ },
    { type: `text`, text: text.slice(sel.focusOffset), id: keyCounter++ },
  );
}

function clear(index: number) {
  // only called from type=span not type=text
  excerpts.value.splice(
    index - 1,
    3,
    {
      type: `text`,
      text: (excerpts.value[index - 1]?.text ?? ``)
        + (excerpts.value[index]?.text ?? ``)
        + (excerpts.value[index + 1]?.text ?? ``),
      id: keyCounter++,
    })
}


function finalize() {
  // i feel like i should be doing this thru vue but that felt even hackier

  let finalCounter = 0;
  const groupToCounter = new Map<string, number>();
  function _getCounter(group: string) {
    if (!groupToCounter.has(group)) {
      groupToCounter.set(group, finalCounter++)
    }
    return groupToCounter.get(group)!;
  }

  let lastTitle = null;
  const ret = [];
  for (const node of p.value?.childNodes ?? []) {
    if (node instanceof HTMLElement) {
      if (node.title !== undefined && node.title !== `` && node.title !== lastTitle) {
        const [firstNum, ...rest] = node.title.split(`,`).map(_getCounter).sort((a, b) => a - b);
        ret.push(`[${firstNum!}`);
        for (const num of rest) {
          ret.push(`,${num}`);
        }
        ret.push(`]`);
        lastTitle = node.title;
      }
    }
    ret.push(node.textContent);
  }
  return ret.join(``);
}

function copy() {
  navigator.clipboard.writeText(finalize());
}

</script>

<style scoped>
button {
  padding: 3px;
  margin: 2px;
  border: 1px solid gray;
}

#copy::after {
  content: "📋";
}
</style>