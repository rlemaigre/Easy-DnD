<template>
    <div class="generic">
        <component :is="comp" v-bind="props" class="inner"></component>
        <slot/>
    </div>
</template>

<script>
import Row from "./Row";
import Column from "./Column";
import Atomic from "./Atomic";

export default {
  name: 'Generic',
  components: { Atomic, Row },
  props: ['model'],
  computed: {
    comp() {
      if (typeof this.model === "object") {
        if (this.model.type === 'row') {
          return Row;
        } else {
          return Column;
        }
      } else {
        return Atomic;
      }
    },
    props() {
      if (typeof this.model === "object") {
        return {
          items: this.model.items
        }
      } else {
        return {
          data: this.model
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">

    .generic {
        flex: 1;
        display: flex;
        align-items: stretch;
        margin: 20px;

        .inner {
            width: 100%;
            height: 100%;
        }
    }

</style>
