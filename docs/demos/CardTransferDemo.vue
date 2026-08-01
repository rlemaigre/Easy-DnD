<template>
  <DemoFrame
    title="Transfer rich cards"
    description="The list state changes, while custom slots keep drag images and insertion feedback compact."
    docs-link="/components/droplist.html"
    docs-label="View DropList component docs →"
    @reset="reset"
  >
    <!-- #region demo-template -->
    <div class="dnd-demo__grid">
      <div v-for="list in lists" :key="list.id">
        <span class="dnd-demo__label">{{ list.label }}</span>
        <DropList
          class="dnd-demo__list"
          :items="list.cards"
          mode="cut"
          @insert="insert(list.cards, $event)"
          @reorder="$event.apply(list.cards)"
        >
          <template #item="{ item }">
            <Drag
              :key="item.id"
              class="dnd-demo__card"
              type="card"
              :data="item"
              @cut="remove(list.cards, item)"
            >
              <img
                class="demo-card-avatar"
                :src="item.avatar"
                :alt="`${item.author} avatar`"
                width="40"
                height="40"
              />
              <span class="demo-card-copy">
                <strong>{{ item.title }}</strong>
                <small>{{ item.author }} · {{ item.detail }}</small>
              </span>
              <template #drag-image>
                <div class="dnd-demo__ghost demo-card-ghost">
                  <img
                    :src="item.avatar"
                    alt=""
                    width="28"
                    height="28"
                  />
                  {{ item.title }}
                </div>
              </template>
            </Drag>
          </template>
          <template #feedback>
            <div key="feedback" class="dnd-demo__feedback" />
          </template>
          <template #empty>
            <small key="empty">No cards</small>
          </template>
        </DropList>
      </div>
    </div>
    <!-- #endregion demo-template -->
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region demo-script
import { reactive } from 'vue';
import { Drag, DropList } from 'vue-easy-dnd';
import avatarAlex from './assets/avatar-alex.jpg';
import avatarJordan from './assets/avatar-jordan.jpg';
import avatarSam from './assets/avatar-sam.jpg';
import type { DemoCard, DemoInsertEvent } from './types';

interface CardList {
  id: string;
  label: string;
  cards: DemoCard[];
}

const makeLists = (): CardList[] => [
  {
    id: 'inbox',
    label: 'Inbox',
    cards: [
      {
        id: 1,
        title: 'Brunch this weekend?',
        detail: '10 min ago',
        author: 'Alex Chen',
        avatar: avatarAlex
      },
      {
        id: 2,
        title: 'Summer launch notes',
        detail: '35 min ago',
        author: 'Sam Rivera',
        avatar: avatarSam
      }
    ]
  },
  {
    id: 'done',
    label: 'Saved',
    cards: [{
      id: 3,
      title: 'Ideas for the docs',
      detail: 'Yesterday',
      author: 'Jordan Lee',
      avatar: avatarJordan
    }]
  }
];
const lists = reactive<CardList[]>(makeLists());

const insert = (cards: DemoCard[], event: DemoInsertEvent<DemoCard>) => {
  cards.splice(event.index, 0, event.data);
};
const remove = (cards: DemoCard[], card: DemoCard) => {
  const index = cards.findIndex(value => value.id === card.id);
  if (index >= 0) cards.splice(index, 1);
};
const reset = () => lists.splice(0, lists.length, ...makeLists());
// #endregion demo-script
</script>

<style scoped>
.demo-card-avatar,
.demo-card-ghost img {
  flex: none;
  border-radius: 50%;
  object-fit: cover;
}

.demo-card-copy {
  min-width: 0;
}

.demo-card-copy strong,
.demo-card-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demo-card-ghost {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
