<template>
  <Page class="wrapper">
    <generic :model="data" class="root"></generic>
  </Page>
</template>

<script>
import Page from './components/scaffold/Page'

import "../lib/src/js/DragImagesManager.js";

export default {
  name: 'App7',
  components: { Page },
  data () {
    return {
      key: 0,
      data: null
    }
  },
  methods: {
    genNum() {
      this.key++;
      return this.key;
    }
  },
  created() {
    this.data = {
      key: this.genNum(),
      type: 'col',
      items: [
        this.genNum(),
        this.genNum(),
        {
          key: this.genNum(),
          type: 'row',
          items: [
            this.genNum(),
            this.genNum(),
            this.genNum(),
            {
              key: this.genNum(),
              type: 'col',
              items: [
                this.genNum(),
                this.genNum(),
                this.genNum()
              ]
            }
          ]
        },
        this.genNum(),
        this.genNum()
      ]
    };
  }
}
</script>

<style lang="scss">
html, body, #app, .v-application--wrap, .v-content, .v-content__wrap {
  height: 100%;
}

</style>

<style scoped lang="scss">
.root {
  width: 800px;
  padding: 50px;
}
</style>
