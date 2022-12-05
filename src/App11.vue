<template>
    <v-app>
        <v-content>
          <div id="scroller">
            <v-container fluid>
                <v-row align-content="stretch">
                    <v-col>
                      Hold down on items for 500ms before they will be draggable. Short tap vibration will happen on mobile
                        <v-list three-line class="list1">
                            <drop-list
                                :items="items1"
                                mode="cut"
                                no-animations
                                @reorder="$event.apply(items1)"
                                @insert="insert1"
                            >
                                <template v-slot:item="{item, reorder, index}">
                                    <drag :key="`item-${item}`" :data="item" @cut="remove(items1, item)" :delay="500" :vibration="50">
                                        <v-list-item
                                            style="background-color: white; user-select: none"
                                            :style="reorder ? {borderLeft: '2px solid #1976D2', marginLeft:'-2px'} : {}"
                                        >
                                            <v-list-item-avatar>
                                              {{ index }}
                                            </v-list-item-avatar>
                                            <v-list-item-content>
                                                <v-list-item-title v-html="item"/>
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-divider/>
                                    </drag>
                                </template>
                                <template v-slot:inserting-drag-image="{data}">
                                    <v-list-item-avatar style="transform:translate(-50%, -50%) scale(1.5)">
                                        <img :src="data"/>
                                    </v-list-item-avatar>
                                </template>
                                <template v-slot:reordering-drag-image/>
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

export default {
    name: "App",
    components: {
        Drag,
        DropList,
        Drop
    },
    data: function () {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        const arr = []
        for (const index in chars) {
          arr.push(`${chars[index]}-${index}`)
          arr.push(`2x${chars[index]}-${index}`)
        }

        return {
            items1: arr,
            items2: []
        };
    },
    methods: {
        insert1(event) {
            this.items1.splice(event.index, 0, event.data);
        },
        insert2(event) {
            this.items2.splice(event.index, 0, event.data);
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
