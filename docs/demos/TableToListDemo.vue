<template>
  <DemoFrame
    title="Copy rows into a list"
    description="Table rows stay in place because the destination uses copy mode."
    docs-link="/components/droplist.html"
    docs-label="View DropList component docs →"
    @reset="selected = []"
  >
    <div class="dnd-demo__grid">
      <div class="demo-table-wrap">
        <span class="dnd-demo__label">Products</span>
        <table class="demo-table">
          <thead><tr><th>Name</th><th>Price</th></tr></thead>
          <tbody>
            <Drag
              v-for="product in products"
              :key="product.id"
              tag="tr"
              type="product"
              :data="product"
            >
              <td>{{ product.name }}</td>
              <td>${{ product.price }}</td>
              <template #drag-image>
                <div class="dnd-demo__ghost demo-product-drag-image">
                  <img :src="product.image" :alt="`${product.name} preview`" />
                  <span>{{ product.name }} · ${{ product.price }}</span>
                </div>
              </template>
            </Drag>
          </tbody>
        </table>
      </div>
      <div>
        <span class="dnd-demo__label">Selection</span>
        <DropList
          class="dnd-demo__list"
          :items="selected"
          accepts-type="product"
          mode="copy"
          @insert="insert"
          @reorder="$event.apply(selected)"
        >
          <template #item="{ item }">
            <div :key="item.id" class="dnd-demo__card">
              {{ item.name }} · ${{ item.price }}
            </div>
          </template>
          <template #feedback>
            <div key="feedback" class="dnd-demo__feedback" />
          </template>
          <template #empty>
            <small key="empty">Drop a table row here</small>
          </template>
        </DropList>
      </div>
    </div>
  </DemoFrame>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Drag, DropList } from '../../lib/src';
import type { DemoInsertEvent } from './types';
import DemoFrame from './shared/DemoFrame.vue';
import avatarAlex from './assets/avatar-alex.jpg';
import avatarJordan from './assets/avatar-jordan.jpg';
import avatarSam from './assets/avatar-sam.jpg';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

const products: Product[] = [
  { id: 1, name: 'Notebook', price: 12, image: avatarAlex },
  { id: 2, name: 'Pencil case', price: 18, image: avatarJordan },
  { id: 3, name: 'Desk lamp', price: 45, image: avatarSam }
];
const selected = ref<Product[]>([]);
const insert = (event: DemoInsertEvent<Product>) => {
  if (selected.value.some(item => item.id === event.data.id)) return;
  selected.value.splice(event.index, 0, event.data);
};
</script>

<style scoped>
.demo-table-wrap {
  overflow-x: auto;
}

.demo-product-drag-image {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.demo-product-drag-image img {
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  object-fit: cover;
}

.demo-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--vp-c-bg);
}

.demo-table th,
.demo-table td {
  padding: 0.65rem;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
}

.demo-table tbody tr {
  cursor: grab;
}
</style>
