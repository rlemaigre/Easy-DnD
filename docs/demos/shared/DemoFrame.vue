<template>
  <section class="dnd-demo">
    <header class="dnd-demo__header">
      <div>
        <strong>{{ title }}</strong>
        <p v-if="description">
          {{ description }}
        </p>
      </div>
      <button
        v-if="resettable"
        type="button"
        @click="$emit('reset')"
      >
        Reset
      </button>
    </header>
    <div class="dnd-demo__surface">
      <slot />
    </div>
    <footer v-if="$slots.footer || docsLink" class="dnd-demo__footer">
      <span v-if="$slots.footer">
        <slot name="footer" />
      </span>
      <a v-if="docsLink" :href="withBase(docsLink)">
        {{ docsLabel }}
      </a>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress';

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  resettable: {
    type: Boolean,
    default: true
  },
  docsLink: {
    type: String,
    default: ''
  },
  docsLabel: {
    type: String,
    default: 'View component docs →'
  }
});

defineEmits<{
  reset: [];
}>();
</script>
