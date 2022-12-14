<template>
  <flex :items="items" direction="row" />
</template>

<script>
import Flex from './Flex.vue';

export default {
  name: 'Row',
  components: { Flex },
  props: {
    items: {
      type: Array,
      required: true
    }
  }
};
</script>
