<template>
    <v-app>
        <v-content>
            <v-container fluid class="wrapper">
                <drop-list @reorder="" :items="[1,2]" column>
                    <template v-slot:item="{item}">
                        <drag v-if="item === 1" :key="item">testx</drag>
                        <drag v-else :key="item">
                            <drop-list :items="['a','b']" @reorder="" column>
                                <template v-slot:item="{item}">
                                    <drag v-if="item === 'a'" :key="item">test1</drag>
                                    <drag v-else :key="item">test2</drag>
                                </template>
                                <template v-slot:feedback><span :key="122">feedback</span></template>
                            </drop-list>
                        </drag>
                    </template>
                    <template v-slot:feedback><span :key="122">feedback</span></template>
                </drop-list>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
import Drag from "../lib/src/components/Drag";
import DropList from "../lib/src/components/DropList";
import Drop from "../lib/src/components/Drop";

export default {
  components: { Drop, Drag, DropList },
  data () {
    return {
      items: ['a', 'b', 'c', 'd', 'e']
    }
  },
  methods: {
    onInsert(event) {
      this.items.splice(event.index, 0, event.data);
    }
  }
}
</script>

<style lang="scss">
    html, body, #app, .v-application--wrap, .v-content, .v-content__wrap {
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
