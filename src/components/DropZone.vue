<template>
  <drop
    accepts-type="number"
    :accepts-data="accept"
    @drop="drop"
  >
    <slot />
    <template #drag-image="{type, data}">
      <slot
        name="image"
        :type="type"
        :data="data"
      />
    </template>
    <div class="dropped">
      <div v-for="(n, i) in numbers" :key="i">
        Dropped : {{ n }}
      </div>
    </div>
  </drop>
</template>

<script lang="ts">
import Drop from '../../lib/src/components/Drop.vue';
import { dnd } from '../../lib/src';
import type { DragData } from '../../lib/src/types';
import type { PropType } from 'vue';

export default {
  components: { Drop },
  props: {
    accept: {
      type: Function as PropType<(data: DragData) => boolean>,
      required: true
    }
  },
  data () {
    return {
      numbers: [] as number[]
    };
  },
  methods: {
    drop () {
      if (typeof dnd.data === 'number') this.numbers.push(dnd.data);
    }
  }
};
</script>

<style scoped lang="scss">
    .dropped {
        position: absolute;
        top: 20px;
        right: 20px;
    }
</style>
