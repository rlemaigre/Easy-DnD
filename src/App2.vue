<template>
  <Page class="wrapper">
    <div class="row">
      <div class="col">
        <div class="list">
          <drag
            v-for="n in [1,2,3,4,5]"
            :key="n"
            :data="n"
            class="item"
            type="test"
          >
            {{ n }}
          </drag>
        </div>
      </div>
      <div class="col">
        <drop-list
          :items="items"
          accepts-type="test"
          class="list"
          @insert="onInsert"
          @reorder="$event.apply(items)"
        >
          <template #item="{item, reorder}">
            <drag
              :key="item"
              class="item"
              :drag-image-opacity="1"
              :style="{opacity: reorder ? 0 : 1}"
              @cut="items = items.filter(i => i !== item)"
            >
              {{ item }}
            </drag>
          </template>
          <template #feedback="{data}">
            <div :key="data" class="item feedback">
              {{ data }}
            </div>
          </template>
        </drop-list>
      </div>
      <drop
        class="col"
        style="background-color: grey"
        mode="cut"
      />
    </div>
  </Page>
</template>

<script>
import Page from './components/scaffold/Page';

import Drag from "../lib/src/components/Drag";
import DropList from "../lib/src/components/DropList";
import Drop from "../lib/src/components/Drop";
import "../lib/src/js/DragImagesManager.js";

export default {
  components: { Page, Drop, Drag, DropList },
  data () {
    return {
      items: ['a', 'b', 'c', 'd', 'e']
    };
  },
  methods: {
    onInsert (event) {
      console.log('on insert');
      this.items.splice(event.index, 0, event.data);
    }
  }
};
</script>

<style lang="scss">
    html, body, #app, .wrapper {
        height: 100%;
    }

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

                &.drag-mode-reordering {
                    visibility: hidden;
                }

                &.drag-mode-cut {
                    display: none;
                }

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
