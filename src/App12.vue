<template>
    <v-app>
        <v-content>
          <div>
            Testing slots as custom component
            <v-container fluid>
                <v-row align-content="stretch">
                    <v-col>
                        <v-list three-line class="list1">
                            <drop-list
                                :items="items1"
                                no-animations
                                @reorder="$event.apply(items1)"
                                @insert="insert1"
                            >
                                <template v-slot:item="{item, reorder, index}">
                                    <drag :tag="App12Item" :key="`item-${item}`" :data="item" @cut="remove(items1, item)" :vibration="50">
                                      <template v-slot:left>
                                        {{ item }} Left
                                      </template>
                                      <template v-slot:center>
                                        {{ item }} Center
                                      </template>
                                      <template v-slot:right>
                                        {{ item }} Right
                                      </template>
                                    </drag>
                                </template>
                                <template v-slot:drag-image="{data}">
                                    <v-list-item-avatar style="transform:translate(-50%, -50%) scale(1.5)">
                                        <img :src="data"/>
                                    </v-list-item-avatar>
                                </template>
                                <template v-slot:feedback="{data}">
                                    <v-skeleton-loader
                                        type="list-item-avatar-three-line"
                                        :key="data"
                                        style="border-left: 2px solid #1976D2; margin-left: -2px;"
                                    />
                                </template>
                                <template v-slot:empty>
                                    <v-list-item key="empty">
                                        <v-list-item-content>
                                            No items to display in this list
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>
                            </drop-list>
                        </v-list>
                    </v-col>
                </v-row>
            </v-container>
          </div>
        </v-content>
    </v-app>
</template>

<script>
import Drag from "../lib/src/components/Drag";
import Drop from "../lib/src/components/Drop";
import DropList from "../lib/src/components/DropList";
import App12Item from "./components/App12Item";
import "../lib/src/js/DragImagesManager.js";

export default {
    name: "App",
    components: {
        Drag,
        DropList,
        Drop,
    },
    data: function () {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        const arr = []
        for (const index in chars) {
          arr.push(`${chars[index]}`)
        }

        return {
            App12Item,
            items1: arr
        };
    },
    methods: {
        insert1(event) {
            this.items1.splice(event.index, 0, event.data);
        },
        remove(array, value) {
            let index = array.indexOf(value);
            array.splice(index, 1);
        }
    }
};
</script>

<style>
    html,
    body {
        height: 100%;
        font-family: "Roboto";
    }

    .list1 {
        height: 100%;
    }

    .list2 {
        display: flex;
        height: 100%;
    }

    .chip {
        margin: 10px;
    }

    .drop-allowed.drop-in * {
        cursor: inherit !important;
    }

    .handle {
        cursor: grab;
    }

    .default-slot {
      background-color: lightpink;
    }
</style>
