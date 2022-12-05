<template>
  <div class="item">
    <div>
      <slot name="left" />
    </div>
    <div>
      <slot name="center" />
    </div>
    <div>
      <slot name="right" />
    </div>
  </div>
</template>

<script>
export default {
}
</script>

<style>
.item {
  display: flex;
  padding: 20px;
  justify-content: space-between;
}
</style>
