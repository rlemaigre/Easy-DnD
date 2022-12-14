<template>
  <ListItem
    class="skeleton"
  />
</template>

<script>
import ListItem from './ListItem';

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
