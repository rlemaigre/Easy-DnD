<template>
  <article class="dashboard-widget" :class="`dashboard-widget--${widget.kind}`">
    <template v-if="widget.kind === 'metric'">
      <small>{{ widget.label }}</small>
      <strong>{{ widget.value ?? '8,492' }}</strong>
      <span>{{ widget.change ?? '+12.4%' }}</span>
    </template>

    <template v-else-if="widget.kind === 'chart'">
      <header>
        <span>
          <small>{{ widget.label }}</small>
          <strong>$84,240</strong>
        </span>
        <span>Last 12 months</span>
      </header>
      <img
        :src="revenueTrend"
        alt="Abstract upward revenue trend"
        width="720"
        height="300"
      />
    </template>

    <template v-else-if="widget.kind === 'activity'">
      <strong>{{ widget.label }}</strong>
      <ul>
        <li><i class="activity-dot activity-dot--violet" />New workspace created</li>
        <li><i class="activity-dot activity-dot--cyan" />Quarterly report shared</li>
        <li><i class="activity-dot activity-dot--mint" />12 members invited</li>
      </ul>
    </template>

    <template v-else>
      <small>{{ widget.label }}</small>
      <strong>What we learned</strong>
      <p>{{ widget.body ?? 'Add context for your team.' }}</p>
    </template>
  </article>
</template>

<script setup lang="ts">
import revenueTrend from '../assets/revenue-trend.jpg';
import type { DemoWidget } from '../types';

defineProps<{
  widget: DemoWidget;
}>();
</script>

<style scoped>
.dashboard-widget {
  width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
}

.dashboard-widget > small,
.dashboard-widget--text > small {
  display: block;
  margin: 0 0 0.2rem;
  color: var(--vp-c-text-2);
  font-size: 0.68rem;
  text-transform: uppercase;
}

.dashboard-widget--metric > strong {
  display: block;
  font-size: clamp(1.15rem, 3vw, 1.65rem);
  line-height: 1.1;
}

.dashboard-widget--metric > span {
  color: #16845c;
  font-size: 0.72rem;
  font-weight: 700;
}

.dashboard-widget--chart header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.dashboard-widget--chart header > * {
  min-width: 0;
}

.dashboard-widget--chart header small,
.dashboard-widget--chart header strong {
  display: block;
}

.dashboard-widget--chart header small,
.dashboard-widget--chart header > span:last-child {
  color: var(--vp-c-text-2);
  font-size: 0.68rem;
}

.dashboard-widget--chart img {
  display: block;
  width: 100%;
  height: auto;
  max-height: none;
  border-radius: 7px;
  object-fit: contain;
}

.dashboard-widget--activity ul {
  display: grid;
  gap: 0.55rem;
  margin: 0.65rem 0 0;
  padding: 0;
  list-style: none;
}

.dashboard-widget--activity li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
  line-height: 1.35;
}

.activity-dot {
  width: 0.5rem;
  height: 0.5rem;
  flex: none;
  border-radius: 50%;
  background: #7768e5;
}

.activity-dot--cyan {
  background: #1fb6d5;
}

.activity-dot--mint {
  background: #24b47e;
}

.dashboard-widget--text > strong {
  display: block;
}

.dashboard-widget--text p {
  margin: 0.35rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  line-height: 1.45;
}
</style>
