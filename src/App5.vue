<template>
    <Page class="wrapper">
        <drop-list :items="[1,2]" column>
            <template v-slot:item="{item}">
                <drag v-if="item === 1">testx</drag>
                <drag v-else>
                    <drop-list :items="['a','b']" column>
                        <template v-slot:item="{item}">
                            <drag v-if="item === 'a'">test1</drag>
                            <drag v-else>test2</drag>
                        </template>
                        <template v-slot:feedback><span :key="122">feedback</span></template>
                    </drop-list>
                </drag>
            </template>
            <template v-slot:feedback><span :key="122">feedback</span></template>
        </drop-list>
    </Page>
</template>

<script>
import Page from './components/scaffold/Page'

import Drag from "../lib/src/components/Drag";
import DropList from "../lib/src/components/DropList";

export default {
  components: { Page, Drag, DropList },
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
