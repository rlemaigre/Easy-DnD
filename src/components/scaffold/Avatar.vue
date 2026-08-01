<template>
  <img
    :src="src"
    style="width: 40px; height: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border-radius: 100%;"
  />
</template>

<script lang="ts">
export default {
  props: {
    src: {
      type: String,
      required: true
    }
  }
};
</script>
