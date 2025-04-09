<template>
  <div class="wrapper">
    <Drop class="list-scroller">
      <drop-list :items="items1" class="list">
        <template #item="{ item }">
          <drag :key="item" class="item">
            <div v-html="item" />
          </drag>
        </template>
        <template #feedback />
      </drop-list>

      <drop-list :items="items2" class="list">
        <template #item="{ item }">
          <drag :key="item" class="item">
            <div v-html="item" />
          </drag>
        </template>
        <template #feedback />
      </drop-list>

      <drop-list :items="items3" class="list">
        <template #item="{ item }">
          <drag :key="item" class="item">
            <div v-html="item" />
          </drag>
        </template>
        <template #feedback />
      </drop-list>
    </Drop>
  </div>
</template>

<script>
import DropList from '../lib/src/components/DropList';
import Drag from '../lib/src/components/Drag';
import Drop from '../lib/src/components/Drop';

export default {
  name: 'App',
  components: {
    Drag,
    DropList,
    Drop
  },
  data: function () {
    return {
      items1: ['a', 'b', 'c'],
      items2: [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
      ],
      items3: [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
      ],
    };
  },
};
</script>

<style>
html,
body,
#app,
.wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.list-scroller {
  display: flex;
  gap: 20px;
  max-height: 300px;
  max-width: 450px;
  overflow-x: auto;
  padding: 50px;
  border: 1px solid black;
}
.list {
  border: 1px solid black;
  width: 200px;
  max-height: 300px;
  overflow-y: auto;
  flex-shrink: 0;
}
.item {
  padding: 20px;
  margin: 10px;
  background-color: #dcdcff;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
