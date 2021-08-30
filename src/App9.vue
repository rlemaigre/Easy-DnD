<template>
  <v-app>
    <v-content>
      <v-container fluid class="wrapper">
        <v-row>
          <v-col>
            <drop-list
                :items="items"
                class="list"
                @reorder="$event.apply(items)"
            >
              <template v-slot:item="{ item }">
                <drag class="item" :data="item" :key="item.name">
                  {{ item.name }}
                </drag>
              </template>
            </drop-list>
          </v-col>
          <v-col>
            <drop-list
                :items="items"
                class="list"
                @reorder="$event.apply(items)"
            >
              <template v-slot:item="{ item }">
                <drag class="item" :data="item" :key="item.name">
                  {{ item.name }}
                </drag>
              </template>
            </drop-list>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Drag from "../lib/src/components/Drag.vue";
import DropList from "../lib/src/components/DropList.vue";

export default {
  name: "App",
  components: {
    Drag,
    DropList,
  },
  data: function () {
    return {
      items: [
        {
          name: "Frozen Yogurt",
          calories: 159,
          fat: 6.0,
        },
        {
          name: "Ice cream sandwich",
          calories: 237,
          fat: 9.0,
        },
        {
          name: "Eclair",
          calories: 262,
          fat: 16.0,
        },
        {
          name: "another item in the list",
          calories: 237,
          fat: 9.0,
        },
        {
          name: "another item in the list 2",
          calories: 237,
          fat: 9.0,
        },
        {
          name: "another item in the list 3",
          calories: 237,
          fat: 9.0,
        },
        {
          name: "another item in the list 4",
          calories: 237,
          fat: 9.0,
        },
        {
          name: "another item in the list 5",
          calories: 237,
          fat: 9.0,
        },
        {
          name: "another item in the list 6",
          calories: 237,
          fat: 9.0,
        },
        {
          name: "another item in the list 7",
          calories: 237,
          fat: 9.0,
        },
      ],
      items2: [],
      selected: [],
      selectedList: 0,
    };
  },
};
</script>

<style lang="scss">
html,
body,
#app,
.v-application--wrap,
.v-content,
.v-content__wrap {
  height: 100%;
}

.drop-in {
  box-shadow: 0 0 10px rgba(0, 0, 255, 0.3);
}
</style>

<style scoped lang="scss">
.wrapper {
  .list {
    border: 1px solid black;
    margin: 100px auto;
    width: 200px;
    min-height: 200px;
    max-height: 300px;
    overflow: auto;

    .item {
      padding: 20px;
      margin: 10px;
      background-color: rgb(220, 220, 255);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;

      &.selected {
        border: 2px solid red;
      }

      &.feedback {
        background-color: rgb(255, 220, 220);
        border: 2px dashed black;
      }

      &.drag-image {
        background-color: rgb(220, 255, 220);
        transform: translate(-50%, -50%);
      }
    }
  }
}
</style>
