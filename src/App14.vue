<template>
  <Page class="wrapper">
    <div id="scroller">
      <div class="row">
        <div class="col">
          All component listeners have been removed. Test interactions when not set up correctly
          <List class="list1">
            <drop-list
              :items="items1"
              :scrolling-edge-size="0"
              accepts-type="sample"
            >
              <template #item="{item, reorder, index}">
                <drag
                  :key="`item-${item}`"
                  :data="item"
                >
                  <ListItem
                    style="background-color: white; user-select: none"
                    :style="reorder ? {borderLeft: '2px solid #1976D2', marginLeft:'-2px'} : {}"
                  >
                    <template #side>
                      {{ index }}
                    </template>

                    <div class="title" v-html="item" />
                  </ListItem>
                  <Separator />
                </drag>
              </template>
              <template #drag-image="{data}">
                <div style="transform:translate(-50%, -50%) scale(1.5)">
                  <Avatar :src="data" />
                </div>
              </template>
              <template #reordering-drag-image />
              <template #feedback="{data}">
                <Skeleton
                  :key="data"
                  style="border-left: 2px solid #1976D2; margin-left: -2px;"
                />
              </template>
              <template #empty>
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
            mode="cut"
          >
            <template #item="{item,reorder,index}">
              <drag
                :key="item"
                class="chip"
                :data="item"
              >
                <Chip :color="reorder ? 'blue' : null">
                  {{ item }}
                </Chip>
              </drag>
            </template>
            <template #feedback="{data}">
              <div :key="data" class="chip">
                <Chip color="blue">
                  {{ data }}
                </Chip>
              </div>
            </template>
            <template #drag-image="{data}">
              <Chip :key="data" style="transform: translate(-50%, -50%)">
                {{ data }}
              </Chip>
            </template>
            <template #reordering-drag-image="{ item }" />
          </drop-list>
        </div>
      </div>

      <div
        ref="bottomRight"
        class="mouseovercontainer"
        @mouseenter="onMouseEnterBottomRight"
        @mouseleave="onMouseLeaveBottomRight"
      />
    </div>

    <drop-list
      class="overlapper"
      :items="items1"
      :scrolling-edge-size="0"
    >
      <template #item="{item, reorder, index}">
        <drag
          :key="`item-${item}`"
          :data="item"
          :scrolling-edge-size="100"
        >
          <ListItem
            style="background-color: white; user-select: none"
            :style="reorder ? {borderLeft: '2px solid #1976D2', marginLeft:'-2px'} : {}"
          >
            <template #side>
              {{ index }}
            </template>
            <div class="title" v-html="item" />
          </ListItem>
          <Separator />
        </drag>
      </template>
      <template #drag-image="{data}">
        <div style="transform:translate(-50%, -50%) scale(1.5)">
          <Avatar :src="data" />
        </div>
      </template>
      <template #reordering-drag-image />
      <template #feedback="{data}">
        <Skeleton
          :key="data"
          style="border-left: 2px solid #1976D2; margin-left: -2px;"
        />
      </template>
      <template #empty>
        <ListItem key="empty">
          No items to display in this list
        </ListItem>
      </template>
    </drop-list>
  </Page>
</template>

<script>
import Page from './components/scaffold/Page';
import Avatar from './components/scaffold/Avatar';
import List from './components/scaffold/List';
import ListItem from './components/scaffold/ListItem';
import Separator from './components/scaffold/Separator';
import Skeleton from './components/scaffold/Skeleton';
import Chip from './components/scaffold/Chip';

import Drag from '../lib/src/components/Drag';
import DropList from '../lib/src/components/DropList';
import '../lib/src/js/DragImagesManager.js';

export default {
  name: 'App',
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
    const arr = [];
    for (const char of chars) {
      arr.push(char);
    }

    return {
      items1: arr,
      items2: []
    };
  },
  methods: {
    insert1 (event) {
      this.items1.splice(event.index, 0, event.data);
    },
    insert2 (event) {
      this.items2.splice(event.index, 0, event.data);
    },
    remove (array, value) {
      const index = array.indexOf(value);
      array.splice(index, 1);
    },
    onMouseEnterBottomRight () {
      console.log('triggered enter');
      this.$refs.bottomRight.style.background = 'green';
    },
    onMouseLeaveBottomRight () {
      console.log('triggered leave');
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
