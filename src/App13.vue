<template>
  <div id="app">
    <Drag v-for="n in items" :key="n" :data="n">
      <img alt="Vue logo" src="https://vuejs.org/images/logo.png" width="25%" ondragstart="return false;" />
    </Drag>
    <Drop
        @drop="func"
        style="width: 100%; max-width: 500px; height: 500px; background: #000"
    ></Drop>
  </div>
</template>

<script>
import Drag from "../lib/src/components/Drag.vue";
import Drop from "../lib/src/components/Drop.vue";

export default {
  name: "App",
  data() {
    return {
      items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
  },
  components: {
    Drag,
    Drop,
  },
  methods: {
    func(e) {
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
