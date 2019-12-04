<template>
    <v-app>
        <v-content>
            <v-container fluid class="wrapper">
                <div class="list">
                    <drag v-for="n in [1,2,3,4,5]" :data="n" class="item">{{n}}</drag>
                </div>
                <drop-list :items="['a','b','c','d','e']" class="list">
                    <template v-slot:items="{items, feedback}">
                        <transition-group name="list" tag="div">
                            <div class="item" v-for="item in items" :key="item">{{item}}</div>
                        </transition-group>
                    </template>
                </drop-list>
            </v-container>
        </v-content>
    </v-app>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import Drag from "../lib/src/components/Drag.vue";
    import DropZone from "@/components/DropZone.vue";
    import DropMask from "../lib/src/components/DropMask.vue";
    import DropList from "../lib/src/components/DropList.vue";

    @Component({
        components: {DropMask, DropZone, Drag, DropList}
    })
    export default class App2 extends Vue {


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
            }
        }
    }

    .item {
        transition: transform .3s;
    }

    .list-enter, .list-leave-to {
        visibility: hidden;
    }

    .list-leave-active {
        position: absolute;
        visibility: hidden;
    }
</style>
