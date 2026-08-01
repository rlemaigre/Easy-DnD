<template>
  <Page class="wrapper">
    <Drag
      v-for="n in items"
      :key="n"
      :data="n"
    >
      <img
        alt="Vue logo"
        src="https://vuejs.org/images/logo.png"
        style="width: 200px; height: 200px;"
        ondragstart="return false;"
      />
    </Drag>
    <Drop
      style="width: 100%; max-width: 500px; height: 500px; background: #000"
      @drop="func"
    />
  </Page>
</template>

<script lang="ts">
import Page from './components/scaffold/Page.vue';

import Drag from '../lib/src/components/Drag.vue';
import Drop from '../lib/src/components/Drop.vue';
import '../lib/src/js/DragImagesManager';
import type { DemoDnDEvent } from './types/demo';

export default {
  name: 'App',
  components: {
    Page,
    Drag,
    Drop,
  },
  data () {
    return {
      items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
  },
  methods: {
    func (e: DemoDnDEvent) {
      console.log(e);
    },
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
