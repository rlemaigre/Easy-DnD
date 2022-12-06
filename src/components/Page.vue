<template>
  <div class="page">
    <slot />
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss">
html, body {
  margin: 0;
  height: 100%;
}

.page {
  background: linear-gradient(#fff, #ddd);

  .row {
    display: flex;
    flex-wrap: nowrap;
  }

  .col {
    flex: 1 1 auto;
  }
}
</style>
