<template>
  <Page class="wrapper">
    <div id="scroller">
      <div class="row">
        <div class="col">
          Hold down on items for 500ms before they will be draggable. Short tap vibration will happen on mobile
          <List class="list1">
            <drop-list
              :items="items1"
              mode="cut"
              no-animations
              @reorder="$event.apply(items1)"
              @insert="insert1"
            >
              <template #item="{item, reorder, index}">
                <drag
                  :key="`item-${item}`"
                  :data="item"
                  :delay="500"
                  :vibration="50"
                  @cut="remove(items1, item)"
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
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import Page from './components/scaffold/Page.vue';
import Avatar from './components/scaffold/Avatar.vue';
import List from './components/scaffold/List.vue';
import ListItem from './components/scaffold/ListItem.vue';
import Separator from './components/scaffold/Separator.vue';
import Skeleton from './components/scaffold/Skeleton.vue';

import Drag from '../lib/src/components/Drag.vue';
import DropList from '../lib/src/components/DropList.vue';
import '../lib/src/js/DragImagesManager';
import type { InsertPayload } from './types/demo';

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
    Skeleton
  },
  data: function () {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const arr = [];
    for (const [index] of Array.from(chars).entries()) {
      arr.push(`${chars[index]}-${index}`);
      arr.push(`2x${chars[index]}-${index}`);
    }

    return {
      items1: arr,
      items2: [] as string[]
    };
  },
  methods: {
    insert1 (event: InsertPayload<string>) {
      this.items1.splice(event.index, 0, event.data);
    },
    insert2 (event: InsertPayload<string>) {
      this.items2.splice(event.index, 0, event.data);
    },
    remove (array: string[], value: string) {
      const index = array.indexOf(value);
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
</style>
