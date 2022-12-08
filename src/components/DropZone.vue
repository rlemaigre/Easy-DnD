<template>
    <drop @drop="drop" accepts-type="number" :accepts-data="accept">
        <slot></slot>
        <template v-slot:drag-image="{type, data}">
            <slot name="image" :type="type" :data="data"></slot>
        </template>
        <div class="dropped">
            <div v-for="(n, i) in numbers" :key="i">Dropped : {{n}}</div>
        </div>
    </drop>
</template>

<script>
import Drop from "../../lib/src/components/Drop";
import {dnd} from "../../lib/src";

export default {
  components: { Drop },
  props: {
    accept: {
      type: Function
    }
  },
  data () {
    return {
      numbers: []
    }
  },
  methods: {
    drop() {
      this.numbers.push(dnd.data);
    }
  }
}
</script>

<style scoped lang="scss">
    .dropped {
        position: absolute;
        top: 20px;
        right: 20px;
    }
</style>
