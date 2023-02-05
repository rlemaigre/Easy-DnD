<template>
  <Page class="wrapper">
    <div class="thebox">
      <DropList
        :items="items"
        column
        class="droplist"
        @reorder="$event.apply(items)"
      >
        <template #item="{item, index}">
          <Drag
            :key="item"
            handle=".handle"
          >
            <div
              class="component"
              :class="{'handle': item !== 1}"
              :style="item === 1 ? 'height: 500px;' : 'height: 250px;'"
            >
              <h1>{{ item }}</h1>
            </div>

            <template #drag-image />
          </Drag>
        </template>

        <template #feedback />
      </DropList>
    </div>
  </Page>
</template>

<script>
import Page from './components/scaffold/Page';

import DropList from '../lib/src/components/DropList';
import Drag from '../lib/src/components/Drag';
import '../lib/src/js/DragImagesManager.js';

export default {
  name: 'App',
  components: {
    Page,
    DropList,
    Drag
  },
  data () {
    return {
      items: [0, 1],
    };
  },
  methods: {
    func (e) {
      console.log(e);
    },
  },
};
</script>

<style>
.thebox {
  margin: 200px;
  height: 1024px;
  width: 800px;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid black;
}

.thebox > .droplist {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.component {
  width: 100%;
}

.component.handle {
  border: 2px dashed orangered;
  cursor: move;
}
</style>
