<script setup lang="ts">
function handle(c: ClipboardEvent) {
  if (!(c.target instanceof Element)) {
    return;
  }
  const article = c.target.parentElement?.querySelector(`article`);
  if (article) {
    article.textContent = c.clipboardData?.getData(`text/plain`) ?? null;
  }
  article?.classList.remove(`invisible`);
  c.target.classList.add(`invisible`);
}
</script>

<template>
  <div>
    <article class="invisible"></article>
    <textarea @paste="handle"></textarea>
  </div>
</template>

<style scoped>
.invisible {
  display: none;
}

div {
  flex: 1;
}

article, textarea {
  width: 100%;
  height: 100%;
  font-family: monospace;
}

.read-the-docs {
  color: #888;
}
</style>
