<template>
  <Page class="wrapper">
    <div class="row">
      <div class="col">
        <drop-list
          :items="items"
          class="list"
          mode="cut"
          @reorder="$event.apply(items)"
        >
          <template #item="{ item }">
            <drag
              :key="item.name"
              class="item"
              :data="item"
              @cut="onCut"
            >
              {{ item.name }}
            </drag>
          </template>
          <template #feedback />
        </drop-list>
      </div>
      <div class="col">
        <drop
          :class="{'hovering': active}"
          class="dropper"
          @dragend="(e) => onDragEnd('active', e)"
          @dragenter="(e) => onDragEnter('active', e)"
          @drop="onDrop"
          @dragleave="(e) => onDragLeave('active', e)"
        />
        <drop
          :class="{'hovering': active2}"
          class="dropper"
          @dragend="(e) => onDragEnd('active2', e)"
          @dragenter="(e) => onDragEnter('active2', e)"
          @dragleave="(e) => onDragLeave('active2', e)"
        />
      </div>
    </div>
  </Page>
</template>

<script>
import Page from './components/scaffold/Page';

import Drag from '../lib/src/components/Drag';
import DropList from '../lib/src/components/DropList';
import Drop from '../lib/src/components/Drop';
import '../lib/src/js/DragImagesManager.js';

export default {
  name: 'App',
  components: {
    Page,
    Drag,
    DropList,
    Drop
  },
  data: function () {
    return {
      items: [
        {
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
        },
        {
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0,
        },
        {
          name: 'Eclair',
          calories: 262,
          fat: 16.0,
        },
        {
          name: 'another item in the list',
          calories: 237,
          fat: 9.0,
        },
        {
          name: 'another item in the list 2',
          calories: 237,
          fat: 9.0,
        },
        {
          name: 'another item in the list 3',
          calories: 237,
          fat: 9.0,
        },
        {
          name: 'another item in the list 4',
          calories: 237,
          fat: 9.0,
        },
        {
          name: 'another item in the list 5',
          calories: 237,
          fat: 9.0,
        },
        {
          name: 'another item in the list 6',
          calories: 237,
          fat: 9.0,
        },
        {
          name: 'another item in the list 7',
          calories: 237,
          fat: 9.0,
        },
      ],
      items2: [],
      selected: [],
      selectedList: 0,
      timer: null,
      active: false,
      active2: false
    };
  },
  methods: {
    onDragEnter (variable, e) {
      this[variable] = true;
      this.timer = setInterval(() => {
        console.log('Logging Data...', variable, e);
      }, 1000);
    },
    onDragEnd (variable, e) {
      console.log('DRAG END (esc)', variable, e);
      this.onDragLeave(variable, e);
    },
    onDragLeave (variable, e) {
      console.log('Called drag leave', variable, e);
      this[variable] = false;
      clearInterval(this.timer);
    },
    onDrop (e) {
      console.log('DROP', e);
    },
    onCut (e) {
      console.log('CUT', e);
    }
  }
};
</script>

<style lang="scss">
html,
body,
#app,
.v-application--wrap,
.v-content,
.v-content__wrap {
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
    min-height: 200px;
    max-height: 300px;
    overflow: auto;

    .item {
      padding: 20px;
      margin: 10px;
      background-color: rgb(220, 220, 255);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;

      &.selected {
        border: 2px solid red;
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

.dropper {
  height: 200px;
  width: 200px;
  background-color: red;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 50px 0px;

  &.hovering {
    background-color: blue;
  }

  &:before {
    content: 'Hover here (check console). Pressing ESC will call event dragend';
    color: #fff;
    padding: 8px;
  }
}
</style>
