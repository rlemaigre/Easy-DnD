<template>
  <Page class="wrapper">
    <div class="row">
      <div class="col">
        <drag
          :data="selected"
          go-back
          :vibration="10"
        >
          data table needs reimplementing for Vue3
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="desserts"
            item-key="name"
            show-select
          />
          <template #drag-image>
            <Chip color="red" style="transform: translate(10px, 5px)">
              {{ selected.length }}
            </Chip>
          </template>
        </drag>
      </div>
      <div class="col">
        <drop
          style="height:100%"
          :tag="List"
          three-line
          class="my-list"
          @drop="onDrop"
        >
          <template v-for="(list, index) in lists" :key="index">
            <ListItem>
              <template #side>
                <span class="white--text">{{ list.length }}</span>
              </template>

              <div class="title">
                List {{ index }}
              </div>
              <div class="subtitle">
                {{ list.map(l => l.name).join(", ") }}<br />
                {{ list.map(l => l.calories).join(", ") }}
              </div>
            </ListItem>
            <Separator />
          </template>
        </drop>
      </div>
    </div>
  </Page>
</template>

<script>
import Page from './components/scaffold/Page';
import List from './components/scaffold/List';
import ListItem from './components/scaffold/ListItem';
import Separator from './components/scaffold/Separator';
import Chip from './components/scaffold/Chip';

import Drag from '../lib/src/components/Drag';
import Drop from '../lib/src/components/Drop';
import '../lib/src/js/DragImagesManager.js';

export default {
  name: 'App',
  components: {
    Drag,
    Drop,
    Page,
    ListItem,
    Separator,
    Chip
  },
  data: function () {
    return {
      headers: [
        { text: 'Dessert (100g serving)', value: 'name' },
        { text: 'Calories', value: 'calories' },
        { text: 'Fat (g)', value: 'fat' }
      ],
      desserts: [
        {
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0
        },
        {
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0
        },
        {
          name: 'Eclair',
          calories: 262,
          fat: 16.0
        },
        {
          name: 'Cupcake',
          calories: 305,
          fat: 3.7
        },
        {
          name: 'Gingerbread',
          calories: 356,
          fat: 16.0
        },
        {
          name: 'Jelly bean',
          calories: 375,
          fat: 0.0
        },
        {
          name: 'Lollipop',
          calories: 392,
          fat: 0.2
        },
        {
          name: 'Honeycomb',
          calories: 408,
          fat: 3.2
        },
        {
          name: 'Donut',
          calories: 452,
          fat: 25.0
        },
        {
          name: 'KitKat',
          calories: 518,
          fat: 26.0
        },
      ],
      selected: [],
      lists: []
    };
  },
  computed: {
    List () {
      return List;
    }
  },
  methods: {
    onDrop (event) {
      this.lists.push(event.data);
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

    .my-list.drop-allowed {
        outline: 1px dashed green;
    }

</style>
