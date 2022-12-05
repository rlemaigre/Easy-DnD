<template>
    <flex :items="items" direction="row"></flex>
</template>

<script>
import Flex from "./Flex.vue";

export default {
  name: 'Row',
  components: { Flex },
  props: ['items']
}
</script>
