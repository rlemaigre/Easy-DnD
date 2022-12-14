<template>
  <Page class="wrapper">
    Testing slots as custom component
    <div class="row">
      <div class="col">
        <List class="list1">
          <drop-list
            :items="items1"
            no-animations
            @reorder="$event.apply(items1)"
            @insert="insert1"
          >
            <template #item="{item, reorder, index}">
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

<script>
import Page from './components/scaffold/Page';
import Avatar from './components/scaffold/Avatar';
import List from './components/scaffold/List';
import ListItem from './components/scaffold/ListItem';
import Skeleton from './components/scaffold/Skeleton';

import Drag from '../lib/src/components/Drag';
import DropList from '../lib/src/components/DropList';
import App12Item from './components/App12Item';
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
    Skeleton
  },
  data () {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const arr = [];
    for (const index in chars) {
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
    insert1 (event) {
      this.items1.splice(event.index, 0, event.data);
    },
    remove (array, value) {
      let index = array.indexOf(value);
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
