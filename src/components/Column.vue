<template>
  <flex :items="items" direction="column" />
</template>

<script>
import Flex from "./Flex";

export default {
  name: 'Column',
  components: { Flex },
  props: {
    items: {
      type: Array,
      required: true
    }
  }
};
</script>
