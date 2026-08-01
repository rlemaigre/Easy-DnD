<template>
  <DemoFrame
    title="Build a dashboard"
    description="Copy palette widgets into nested rows and columns, then move them between regions."
    docs-link="/components/droplist.html#nested-droplists"
    docs-label="View nested DropList docs →"
    @reset="dashboard = makeDashboard()"
  >
    <!-- #region demo-template -->
    <div class="demo-dashboard-builder">
      <aside class="demo-dashboard-palette">
        <span class="dnd-demo__label">Widget library</span>
        <p>Drag a widget onto any dotted region.</p>
        <div class="demo-dashboard-palette__items">
          <Drag
            v-for="widget in palette"
            :key="widget.id"
            class="demo-dashboard-palette__item"
            type="widget"
            :data="widget"
          >
            <span class="demo-dashboard-palette__icon" aria-hidden="true">
              {{ widgetIcon[widget.kind] }}
            </span>
            <span>
              <strong>{{ widget.label }}</strong>
              <small>{{ widgetDescription[widget.kind] }}</small>
            </span>
            <template #drag-image>
              <div class="dnd-demo__ghost">
                <img :src="widgetImage[widget.kind]" :alt="`${widget.label} preview`" />
                <span>{{ widget.label }}</span>
              </div>
            </template>
          </Drag>
        </div>
      </aside>
      <section class="demo-dashboard-canvas">
        <header>
          <span>
            <small>Overview</small>
            <strong>Product performance</strong>
          </span>
          <span class="demo-dashboard-live">Live</span>
        </header>
        <NestedListNode
          :group="dashboard"
          rich
          @operation="applyOperation"
        />
      </section>
    </div>
    <!-- #endregion demo-template -->
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region demo-script
import { ref } from 'vue';
import { Drag } from 'vue-easy-dnd';
import type { DemoGroup, DemoTreeOperation, DemoWidget } from './types';
import { applyDemoTreeOperation } from './types';
import NestedListNode from './shared/NestedListNode.vue';
import avatarAlex from './assets/avatar-alex.jpg';
import avatarJordan from './assets/avatar-jordan.jpg';
import avatarSam from './assets/avatar-sam.jpg';
import revenueTrend from './assets/revenue-trend.jpg';

const palette: DemoWidget[] = [
  {
    id: 101,
    label: 'Note',
    kind: 'text',
    body: 'Add context for your team.'
  },
  {
    id: 102,
    label: 'KPI',
    kind: 'metric',
    value: '8,492',
    change: '+12.4%'
  },
  { id: 103, label: 'Trend chart', kind: 'chart' },
  { id: 104, label: 'Activity', kind: 'activity' }
];

const widgetIcon: Record<DemoWidget['kind'], string> = {
  text: 'Aa',
  metric: '↗',
  chart: '⌁',
  activity: '•••'
};

const widgetDescription: Record<DemoWidget['kind'], string> = {
  text: 'Supporting copy',
  metric: 'Headline value',
  chart: 'Image visualization',
  activity: 'Recent events'
};

const widgetImage: Record<DemoWidget['kind'], string> = {
  text: avatarAlex,
  metric: avatarJordan,
  chart: revenueTrend,
  activity: avatarSam
};

const makeDashboard = (): DemoGroup => ({
  id: 1,
  direction: 'column',
  items: [
    {
      id: 2,
      direction: 'row',
      items: [
        {
          id: 3,
          label: 'Monthly revenue',
          kind: 'metric',
          value: '$84.2k',
          change: '+18.2%'
        },
        {
          id: 4,
          label: 'Active accounts',
          kind: 'metric',
          value: '2,849',
          change: '+6.7%'
        },
        {
          id: 5,
          label: 'Conversion',
          kind: 'metric',
          value: '7.4%',
          change: '+1.1%'
        }
      ]
    },
    {
      id: 6,
      direction: 'row',
      items: [
        { id: 7, label: 'Revenue trend', kind: 'chart' },
        { id: 8, label: 'Recent activity', kind: 'activity' }
      ]
    },
    {
      id: 9,
      label: 'Quarterly note',
      kind: 'text',
      body: 'Growth is strongest in self-serve teams. Focus the next release on faster onboarding and clearer activation milestones.'
    }
  ]
});
const dashboard = ref<DemoGroup>(makeDashboard());
const applyOperation = (operation: DemoTreeOperation) => {
  dashboard.value = applyDemoTreeOperation(dashboard.value, operation);
};
// #endregion demo-script
</script>

<style scoped>
.demo-dashboard-builder {
  display: grid;
  grid-template-columns: minmax(150px, 0.32fr) minmax(0, 1fr);
  gap: 1rem;
  min-width: 0;
}

.demo-dashboard-palette,
.demo-dashboard-canvas {
  min-width: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}

.demo-dashboard-palette {
  padding: 0.85rem;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 70%, var(--vp-c-bg));
}

.demo-dashboard-palette > p {
  margin: -0.15rem 0 0.85rem;
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  line-height: 1.4;
}

.demo-dashboard-palette__items {
  display: grid;
  gap: 0.5rem;
}

.demo-dashboard-palette__item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9px;
  background: var(--vp-c-bg);
  cursor: grab;
}

.demo-dashboard-palette__item span:last-child {
  min-width: 0;
  overflow-wrap: anywhere;
}

.demo-dashboard-palette__item strong,
.demo-dashboard-palette__item small {
  display: block;
}

.demo-dashboard-palette__item small {
  color: var(--vp-c-text-2);
  font-size: 0.7rem;
}

.demo-dashboard-palette__icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: none;
  place-items: center;
  border-radius: 7px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 0.75rem;
  font-weight: 700;
}

.demo-dashboard-canvas {
  overflow: hidden;
  background: var(--vp-c-bg);
}

.demo-dashboard-canvas > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.demo-dashboard-canvas > header small,
.demo-dashboard-canvas > header strong {
  display: block;
}

.demo-dashboard-canvas > header small {
  color: var(--vp-c-text-2);
  font-size: 0.7rem;
}

.demo-dashboard-live {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: color-mix(in srgb, #24b47e 16%, transparent);
  color: #16845c;
  font-size: 0.7rem;
  font-weight: 700;
}

.dnd-demo__ghost {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.dnd-demo__ghost img {
  width: 1.55rem;
  height: 1.55rem;
  border-radius: 0.35rem;
  object-fit: cover;
}

@container (max-width: 700px) {
  .demo-dashboard-builder {
    grid-template-columns: 1fr;
  }

  .demo-dashboard-palette__items {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container (max-width: 420px) {
  .demo-dashboard-palette__items {
    grid-template-columns: 1fr;
  }
}
</style>
