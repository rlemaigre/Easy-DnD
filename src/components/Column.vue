<template>
  <flex :items="items" direction="column" />
</template>

<script lang="ts">
import Flex from './Flex.vue';
import type { PropType } from 'vue';
import type { NestedItem } from '../types/demo';

export default {
  name: 'Column',
  components: { Flex },
  props: {
    items: {
      type: Array as PropType<NestedItem[]>,
      required: true
    }
  }
};
</script>
