<template>
    <Page class="wrapper">
      <div id="scroller">
        <div class="row">
            <div class="col">
              Hold down on items for 500ms before they will be draggable. Short tap vibration will happen on mobile
                <List class="list1">
                    <drop-list
                        :items="items1"
                        :scrolling-edge-size="0"
                        mode="cut"
                        @reorder="$event.apply(items1)"
                        @insert="insert1"
                    >
                        <template v-slot:item="{item, reorder, index}">
                            <drag :key="`item-${item}`" :data="item" @cut="remove(items1, item)" :delay="500" :vibration="5">
                                <ListItem
                                    style="background-color: white; user-select: none"
                                    :style="reorder ? {borderLeft: '2px solid #1976D2', marginLeft:'-2px'} : {}"
                                >
                                  <template v-slot:side>
                                    {{ index }}
                                  </template>

                                  <div class="title" v-html="item"/>
                                </ListItem>
                              <Separator />
                            </drag>
                        </template>
                        <template v-slot:drag-image="{data}">
                            <div style="transform:translate(-50%, -50%) scale(1.5)">
                              <Avatar :src="data" />
                            </div>
                        </template>
                        <template v-slot:reordering-drag-image/>
                        <template v-slot:feedback="{data}">
                            <Skeleton
                                :key="data"
                                style="border-left: 2px solid #1976D2; margin-left: -2px;"
                            />
                        </template>
                        <template v-slot:empty>
                            <ListItem key="empty">
                              No items to display in this list
                            </ListItem>
                        </template>
                    </drop-list>
                </List>
            </div>
            <div class="col">
                <drop-list
                    class="list2"
                    :items="items2"
                    @reorder="$event.apply(items2)"
                    @insert="insert2"
                    mode="cut"
                >
                    <template v-slot:item="{item,reorder,index}">
                        <drag :key="item" class="chip" :data="item" @cut="remove(items2, item)">
                            <Chip :color="reorder ? 'blue' : null">{{item}}</Chip>
                        </drag>
                    </template>
                    <template v-slot:feedback="{data}">
                        <div class="chip" :key="data">
                            <Chip color="blue">{{data}}</Chip>
                        </div>
                    </template>
                    <template v-slot:drag-image="{data}">
                        <Chip :key="data" style="transform: translate(-50%, -50%)">{{data}}</Chip>
                    </template>
                    <template v-slot:reordering-drag-image="{ item }"></template>
                </drop-list>
            </div>
        </div>

        <div ref="bottomRight" class="mouseovercontainer" @mouseenter="onMouseEnterBottomRight" @mouseleave="onMouseLeaveBottomRight">

        </div>
      </div>

      <drop-list
          class="overlapper"
          :items="items1"
          :scrolling-edge-size="0"
          mode="cut"
          @reorder="$event.apply(items1)"
          @insert="insert1"
      >
        <template v-slot:item="{item, reorder, index}">
          <drag :key="`item-${item}`" :data="item" @cut="remove(items1, item)" :delay="500" :vibration="5" :scrolling-edge-size="100">
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
        <template v-slot:drag-image="{data}">
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
    </Page>
</template>

<script>
import Page from './components/scaffold/Page'
import Avatar from './components/scaffold/Avatar'
import List from './components/scaffold/List'
import ListItem from './components/scaffold/ListItem'
import Separator from './components/scaffold/Separator'
import Skeleton from './components/scaffold/Skeleton'
import Chip from './components/scaffold/Chip'

import Drag from "../lib/src/components/Drag";
import DropList from "../lib/src/components/DropList";
import "../lib/src/js/DragImagesManager.js";

export default {
    name: "App",
    components: {
      Drag,
      DropList,
      Page,
      Avatar,
      List,
      ListItem,
      Separator,
      Skeleton,
      Chip
    },
    data: function () {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        const arr = []
        for (const char of chars) {
          arr.push(char)
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

    .mouseovercontainer {
      position: fixed;
      bottom: 8px;
      right: 8px;
      width: 200px;
      height: 200px;
      background: purple;
    }

    #scroller {
      height: 90vh;
      width: 85vw;
      margin: auto;
      overflow: auto;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }

    .overlapper {
      background-color: lightblue;
      height: 30vh;
      width: 35vw;
      margin: auto;
      overflow: auto;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
</style>
