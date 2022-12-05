<template>
    <flex :items="items" direction="column"></flex>
</template>

<script>
import Flex from "./Flex";

export default {
  name: 'Column',
  components: { Flex },
  props: ['items']
}
</script>
