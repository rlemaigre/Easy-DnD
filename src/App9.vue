<template>
    <v-app>
        <v-content>
          <div id="scroller">
            <v-container fluid>
                <v-row align-content="stretch">
                    <v-col>
                        <v-list v-for="(items, listIndex) in lists" :key="listIndex" three-line class="list1">
                          List {{ listIndex }}
                            <drop-list
                                :items="items"
                                mode="cut"
                                @reorder="$event.apply(items)"
                                @insert="e => insert1(items, e)"
                            >
                                <template v-slot:item="{item, reorder, index}">
                                    <drag :key="`item-${listIndex}-${item}`" :data="item" @cut="remove(items, item)">
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
                                  <v-chip key="insert-drag-image">
                                    Dragging
                                  </v-chip>
                                </template>
                              <template v-slot:drag-image="{data}">
                                <v-chip key="drag-image">
                                  Dragging
                                </v-chip>
                              </template>
                                <template v-slot:reordering-drag-image>
                                  <v-chip key="reorder-image">
                                    Dragging
                                  </v-chip>
                                </template>
                                <template v-slot:feedback="{data}">
                                  <v-chip :key="data">
                                    Dragging
                                  </v-chip>
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
                    <v-col>
                    </v-col>
                </v-row>
            </v-container>
          </div>
        </v-content>
    </v-app>
</template>

<script>
    import Drag from "../lib/src/components/Drag.vue";
    import Drop from "../lib/src/components/Drop.vue";
    import DropList from "../lib/src/components/DropList.vue";
    import "../lib/src/ts/DragImagesManager.ts";

    export default {
        name: "App",
        components: {
            Drag,
            DropList,
            Drop
        },
        data: function () {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
            const lists = [];
            for (let i = 0; i < 10; i++) {
              lists[i] = [];
              let randItems = Math.floor(Math.random() * chars.length);
              randItems = randItems > 4 ? 4 : randItems;
              for (let j = 0; j < randItems; j++) {
                lists[i].push(chars[j])
              }
            }

            return {
                lists
            };
        },
        methods: {
            insert1(list, event) {
                list.splice(event.index, 0, event.data);
            },
            remove(array, value) {
                let index = array.indexOf(value);
                array.splice(index, 1);
            },
            onMouseEnterBottomRight () {
              console.log('triggered enter')
                this.$refs.bottomRight.style.background = 'green';
            },
            onMouseLeaveBottomRight () {
              console.log('triggered leave')
              this.$refs.bottomRight.style.background = 'purple';
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
      margin-bottom: 50px;
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

    #scroller {
    }
</style>
