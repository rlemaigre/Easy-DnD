<template>
  <Page class="wrapper">
    <div class="row">
      <div class="col">
        <List class="list1">
          <drop-list
            class="list1"
            :items="items1"
            mode="cut"
            @reorder="$event.apply(items1)"
            @insert="insert1"
          >
            <template #item="{item, reorder}">
              <drag
                :key="item.title"
                :data="item"
                @cut="remove(items1, item)"
              >
                <ListItem
                  style="background-color: white"
                  :style="reorder ? {borderLeft: '10px solid #1976D2', marginLeft:'-2px'} : {}"
                >
                  <template #side>
                    <Avatar :src="item.avatar" />
                  </template>

                  <div class="title" v-html="item.title" />
                  <div class="subtitle" v-html="item.subtitle" />
                </ListItem>
                <Separator />
              </drag>
            </template>
            <template #drag-image="{data}">
              <Avatar :src="data.avatar" style="transform:translate(-50%, -50%) scale(1.5)" />
            </template>
            <template #reordering-drag-image />
            <template #feedback="{data}">
              <Skeleton
                :key="data.title"
                style="border-left: 2px solid #1976D2; margin-left: -2px;"
              />
            </template>
          </drop-list>
        </List>
      </div>
      <div class="col">
        <drop-list
          class="list2"
          :items="items2"
          mode="cut"
          @reorder="$event.apply(items2)"
          @insert="insert2"
        >
          <template #item="{item,reorder}">
            <drag
              :key="item.title"
              :data="item"
              @cut="remove(items2, item)"
            >
              <Chip :color="reorder ? 'blue' : undefined">
                {{ item.title }}
              </Chip>
            </drag>
          </template>
          <template #feedback="{data}">
            <div :key="data.title">
              <Chip color="blue">
                {{ data.title }}
              </Chip>
            </div>
          </template>
          <template #drag-image="{data}">
            <Chip :key="data.title" style="transform: translate(-50%, -50%)">
              {{ data.title }}
            </Chip>
          </template>
          <template #reordering-drag-image="{item}" />
        </drop-list>
      </div>
    </div>
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

import "../lib/src/js/DragImagesManager.js";
import Drag from "../lib/src/components/Drag";
import DropList from "../lib/src/components/DropList";

export default {
  name: "App",
  components: {
    Page,
    Avatar,
    Drag,
    DropList,
    List,
    ListItem,
    Separator,
    Skeleton,
    Chip
  },
  data () {
    return {
      items1: [
        {
          avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg",
          title: "Brunch this weekend?",
          subtitle:
                        "<span class='text--primary'>Ali Connors</span> &mdash; I'll be in your neighborhood doing errands this weekend. Do you want to hang out?"
        },
        {
          avatar: "https://cdn.vuetifyjs.com/images/lists/2.jpg",
          title: "Summer BBQ",
          subtitle:
                        "<span class='text--primary'>to Alex, Scott, Jennifer</span> &mdash; Wish I could come, but I'm out of town this weekend."
        },
        {
          avatar: "https://cdn.vuetifyjs.com/images/lists/3.jpg",
          title: "Oui oui",
          subtitle:
                        "<span class='text--primary'>Sandra Adams</span> &mdash; Do you have Paris recommendations? Have you ever been?"
        }
      ],
      items2: [
        {
          avatar: "https://cdn.vuetifyjs.com/images/lists/4.jpg",
          title: "Birthday gift",
          subtitle:
                        "<span class='text--primary'>Trevor Hansen</span> &mdash; Have any ideas about what we should get Heidi for her birthday?"
        },
        {
          avatar: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          title: "Recipe to try",
          subtitle:
                        "<span class='text--primary'>Britta Holt</span> &mdash; We should eat this: Grate, Squash, Corn, and tomatillo Tacos."
        }
      ]
    };
  },
  methods: {
    insert1 (event) {
      console.log('on insert 1');
      this.items1.splice(event.index, 0, event.data);
    },
    insert2 (event) {
      console.log('on insert 2');
      this.items2.splice(event.index, 0, event.data);
    },
    remove (array, value) {
      console.warn('on remove CUT');
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

  .list2 {
      display: flex;
      height: 100%;
  }
</style>
