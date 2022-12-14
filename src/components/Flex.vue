<template>
  <div class="Flex">
    <drop-list
      :items="items"
      class="dl"
      :style="{flexDirection: direction}"
      mode="cut"
      :row="direction === 'row'"
      :column="direction === 'column'"
      :tag="root"
      no-animations
      @insert="onInsert"
      @reorder="onReorder"
    >
      <template #item="{item}">
        <drag
          :key="key(item)"
          tag="generic"
          :model="item"
          :data="item"
          @cut="remove(item)"
        >
          <template #drag-image>
            <div class="drag-image">
              DRAG
            </div>
          </template>
        </drag>
      </template>
      <template #feedback="{data}">
        <div :key="key(data)" class="feedback" />
      </template>
      <template #reordering-feedback="{item}">
        <div key="feedback" class="reordering-feedback" />
      </template>
    </drop-list>
  </div>
</template>

<script>
import DropList from '../../lib/src/components/DropList';
import Drag from '../../lib/src/components/Drag';
import MyDiv from './MyDiv';

export default {
  name: 'Flex',
  components: { Drag, DropList },
  props: {
    items: {
      type: Array,
      required: true
    },
    direction: {
      type: String,
      default: 'auto'
    }
  },
  computed: {
    root () {
      return MyDiv;
    }
  },
  methods: {
    key (item) {
      if (typeof item === 'object') {
        return item.key;
      }
      else {
        return item;
      }
    },
    onInsert (event) {
      this.items.splice(event.index, 0, event.data);
    },
    onReorder (event) {
      event.apply(this.items);
    },
    remove (item) {
      let index = this.items.indexOf(item);
      this.items.splice(index, 1);
    }
  }
};
</script>

<style scoped lang="scss">
    .Flex {
        border: 1px dashed black;

        .dl {
            display: flex;
            align-items: stretch;
        }

        .drag-image {
            background-color: orangered;
            width: 75px;
            height: 75px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .reordering-feedback, .feedback {
            flex: 0 0 0;
            outline: 1px solid blue;
            align-self: stretch;
        }

        .drag-source {
            outline: 2px dashed black;
        }
    }
</style>
