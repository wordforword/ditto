<template>
  <FollowMouse></FollowMouse>
  <div id="container">
    <div>
      <input v-model="store.outputOpenBracket">
      <input v-model="store.outputDelim">
      <input v-model="store.outputCloseBracket">; width of
      <input type="number" v-model="store.outputWidth">
      chars
    </div>
    <div id="sides">
      <Side ref="side-a" @copy="i => copy(i, `a`)"></Side>
      <Side ref="side-b" @copy="i => copy(i, `b`)"></Side>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { whenever, useMagicKeys } from '@vueuse/core';
import Side from './components/Side.vue';
import FollowMouse from './components/FollowMouse.vue';
import { useGlobalStore } from './stores/global';
import type { Finalized } from './types';

const store = useGlobalStore();
const keys = useMagicKeys();

const sideA = useTemplateRef(`side-a`);
const sideB = useTemplateRef(`side-b`);

whenever(keys.escape!, () => {
  store.savedGroupNumbers = [];
  store.finalizeGroup();
});

function fixWidth(str: string) {
  const width = store.outputWidth;
  if (width === 0) {
    return str;
  }
  const ret = [];
  let remainder = str;
  while (/\s/.test(remainder)) {
    let s = remainder.slice(0, width);
    let offset = 0;
    if (s.length === width) {
      while (s && !/\s$/.test(s)) {
        offset++;
        // can be more efficient ofc lol
        s = s.slice(0, -1);
      }
      ret.push(s.slice(0, -1));
    } else {
      ret.push(s);
    }
    remainder = remainder.slice(width - offset);
  }
  ret.push(remainder);
  return ret.join(`\n`).replaceAll(/\n+/g, `\n`);
}

function groupUnchanged(a: Set<any>, b: any[] | null): boolean {
  if (b === null || b.length === 0) {
    return true;
  }
  // else return whether sets are equal
  const setB = new Set(b);
  return a.size === setB.size && a.isSubsetOf(setB);
}

function getGroupMap(...sides: Finalized[][]): [Map<number, number>, number] {
  let counter = 0;
  const map = new Map<number, number>();
  for (const nodes of sides) {
    for (const node of nodes) {
      if (node.groups === null) {
        continue;
      }
      for (const group of node.groups) {
        if (!map.has(group)) {
          map.set(group, counter++);
        }
      }
    }
  }
  return [map, counter];
}

function _finalize(paragraph: number, side: `a` | `b`) {
  if (sideA.value === null || sideB.value === null) {
    // should never be encountered
    return ``;
  }
  const sides = {
    a: sideA.value.requestParagraph(paragraph),
    b: sideB.value.requestParagraph(paragraph)
  };

  let lastGroups = new Set<number>();
  const [groupMap, lastCounter] = getGroupMap(sides.a, sides.b);
  let counter = lastCounter;
  const ret = [];
  for (const node of sides[side]) {
    if (!groupUnchanged(lastGroups, node.groups)) {
      const [firstNum, ...rest] = node.groups!.map(g => {
        if (!groupMap.has(g)) {
          alert(`why doesn't groupMap have ${g}`);
          groupMap.set(g, counter++);
        }
        return groupMap.get(g)!;
      }).sort();
      // force `number` because we ensured in groupUnchanged that node.groups.length > 0
      ret.push(`${store.outputOpenBracket}${firstNum!}`);
      for (const num of rest) {
        ret.push(`,${num}`);
      }
      ret.push(store.outputCloseBracket);
      lastGroups = new Set(node.groups);
    }
    ret.push(node.text);
  }
  return fixWidth(ret.join(``));
}

function finalize(paragraph: number | null, side: `a` | `b`) {
  if (paragraph === null) {
    const ret = [];
    for (let i = 0; i < (sideA.value?.numParagraphs ?? 0); i++) {
      ret.push(_finalize(i, side));
    }
    return ret.join(`\n\n`);
  } else {
    return _finalize(paragraph, side);
  }
}

function copy(paragraph: number | null, side: `a` | `b`) {
  navigator.clipboard.writeText(finalize(paragraph, side));
}

</script>

<style scoped>
input {
  font-family: monospace;
  text-align: center;
}

#sides {
  width: 100vw;
  height: 100vh;
  display: flex;
}
</style>
