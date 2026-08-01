<template>
  <Page class="wrapper">
    Testing slots as custom component
    <div class="row">
      <div class="col">
        <List class="list1">
          <drop-list
            :items="items1"
            @reorder="$event.apply(items1)"
            @insert="insert1"
          >
            <template #item="{item}">
              <drag
                :key="`item-${item}`"
                :tag="App12Item"
                :data="item"
                :vibration="50"
                @cut="remove(items1, item)"
              >
                <template #left>
                  {{ item }} Left
                </template>
                <template #center>
                  {{ item }} Center
                </template>
                <template #right>
                  {{ item }} Right
                </template>
              </drag>
            </template>
            <template #drag-image="{data}">
              <div style="transform:translate(-50%, -50%) scale(1.5)">
                <Avatar :src="data" />
              </div>
            </template>
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
  </Page>
</template>

<script lang="ts">
import Page from './components/scaffold/Page.vue';
import Avatar from './components/scaffold/Avatar.vue';
import List from './components/scaffold/List.vue';
import ListItem from './components/scaffold/ListItem.vue';
import Skeleton from './components/scaffold/Skeleton.vue';

import Drag from '../lib/src/components/Drag.vue';
import DropList from '../lib/src/components/DropList.vue';
import App12Item from './components/App12Item.vue';
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
    Skeleton
  },
  data () {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const arr = [];
    for (const [index] of Array.from(chars).entries()) {
      arr.push(`${chars[index]}`);
    }

    return {
      items1: arr
    };
  },
  computed: {
    App12Item () {
      return App12Item;
    }
  },
  methods: {
    insert1 (event: InsertPayload<string>) {
      this.items1.splice(event.index, 0, event.data);
    },
    remove (array: string[], value: string) {
      const index = array.indexOf(value);
      array.splice(index, 1);
    }
  }
};
</script>

<style>
    .list1 {
        height: 100%;
    }

    .drop-allowed.drop-in * {
        cursor: inherit !important;
    }
</style>
