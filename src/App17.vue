<template>
  <div class="wrapper">
    <div class="row">
      <div class="col">
        <div class="list">
          <drag
            v-for="n in [1, 2, 3, 4, 5]"
            :key="n"
            :data="n"
            class="item"
          >
            {{ n }}
          </drag>
        </div>
      </div>
      <div class="col">
        <drop-list
          :items="items"
          class="list"
          @insert="onInsert"
          @reorder="$event.apply(items)"
        >
          <template #item="{ item }">
            <drag :key="item" class="item">
              {{ item }}
            </drag>
          </template>
          <template #feedback="{ data }">
            <div :key="data" class="item feedback">
              {{ data }}
            </div>
          </template>
        </drop-list>
      </div>
    </div>
  </div>
</template>

<script>
import DropList from '../lib/src/components/DropList';
import Drag from '../lib/src/components/Drag';

export default {
  name: 'MyComponent',
  components: {
    Drag,
    DropList,
  },
  data: function () {
    return {
      items: ['a', 'b', 'c', 'd', 'e'],
    };
  },
  methods: {
    onInsert (event) {
      this.items.splice(event.index, 0, event.data);
    },
  },
};
</script>


<style lang="scss">
.drop-in {
  box-shadow: 0 0 10px rgba(0, 0, 255, 0.3);
}
</style>

<style scoped lang="scss">
.wrapper {
  .list {
    border: 1px solid black;
    margin: 100px auto;
    width: 200px;

    .item {
      padding: 20px;
      margin: 10px;
      background-color: rgb(220, 220, 255);
      display: flex;
      align-items: center;
      justify-content: center;

      &.feedback {
        background-color: rgb(255, 220, 220);
        border: 2px dashed black;
      }

      &.drag-image {
        background-color: rgb(220, 255, 220);
        transform: translate(-50%, -50%);
      }
    }
  }
}
</style>
