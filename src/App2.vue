<template>
    <v-app>
        <v-content>
            <v-container fluid class="wrapper">
                <div class="list">
                    <drag v-for="n in [1,2,3,4,5]" :data="n" class="item">{{n}}</drag>
                </div>
                <drop-list :items="items" class="list">
                    <template v-slot:item="{item}">
                        <drag class="item" :key="item">{{item}}</drag>
                    </template>
                    <template v-slot:feedback="{data}">
                        <div class="item feedback" :key="data">{{data}}</div>
                    </template>
                    <template v-slot:drag-image="{data, type}">
                        <drag class="item drag-image">drag</drag>
                    </template>
                </drop-list>
            </v-container>
        </v-content>
    </v-app>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import Drag from "../lib/src/components/Drag.vue";
    import DropList from "../lib/src/components/DropList.vue";
    import {InsertEvent} from "../lib/src/ts/events";
    import "../lib/src/ts/DragImagesManager.ts";

    @Component({
        components: {Drag, DropList}
    })
    export default class App2 extends Vue {

        items = ['a', 'b', 'c', 'd', 'e'];

        onInsert(event: InsertEvent) {
            this.items.splice(event.index, 0, event.data);
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
