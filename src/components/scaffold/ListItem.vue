<template>
  <div class="list-item">
    <div v-if="!!$slots.side" class="side">
      <slot name="side" />
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss">
.list-item {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-content: center;
  padding: 4px 8px;
  gap: 8px;
  width: 100%;
  min-height: 50px;

  .side {
    flex: 1 1 auto;
    color: #434343;
    font-size: 0.95em;
  }

  .content {
    flex: 1 1 100%;
  }

  .title {
    font-weight: bold;
    font-size: 1.1em;
  }

  .subtitle {
    letter-spacing: 1px;
    font-size: 0.9em;
    font-weight: bold;
    color: #434343;
  }
}
</style>
