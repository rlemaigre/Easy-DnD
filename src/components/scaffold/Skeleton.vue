<template>
  <ListItem
    class="skeleton"
  />
</template>

<script lang="ts">
import ListItem from './ListItem.vue';

export default {
  components: {
    ListItem
  }
};
</script>

<style lang="scss">
.skeleton {
  background: linear-gradient(90deg, #fff, #434343);
}
</style>
