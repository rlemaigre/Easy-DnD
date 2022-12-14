<template>
  <div class="page">
    <slot />
  </div>
</template>

<script>
export default {
};
</script>

<style lang="scss">
html, body {
  margin: 0 !important;
  padding: 0 !important;
  height: 100%;
  font-family: Roboto, Arial;
}

* {
  box-sizing: border-box;
}

.page {
  background: linear-gradient(#fff, #ddd);
  min-height: 100vh;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: auto;

  .row {
    display: flex;
    flex-wrap: nowrap;
  }

  .col {
    flex: 1 1 auto;
  }
}
</style>
