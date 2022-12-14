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

<script>
import Page from './components/scaffold/Page';

import Drag from '../lib/src/components/Drag';
import Drop from '../lib/src/components/Drop';
import '../lib/src/js/DragImagesManager.js';

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
    func (e) {
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
