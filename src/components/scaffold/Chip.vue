<template>
  <div class="chip" :style="{'background-color': color}">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: '#cacaca'
    }
  }
}
</script>

<style lang="scss">
.chip {
  font-size: 12px;
  border-radius: 16px;
  border: 1px solid #a7a7a7;
  margin: 10px;
  color: white;
}
</style>
