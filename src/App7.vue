<template>
    <v-app>
        <v-content>
            <v-container fluid class="wrapper" style="margin-top: 2000px">
                <generic :model="data" class="root"></generic>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
import Drag from "../lib/src/components/Drag";
import DropList from "../lib/src/components/DropList";
import Drop from "../lib/src/components/Drop";

export default {
  name: 'App7',
  components: { Drop, Drag, DropList },
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
