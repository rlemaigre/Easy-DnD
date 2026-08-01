<template>
  <main class="canvas-demo">
    <header class="canvas-demo__header">
      <p class="eyebrow">
        PR #157 regression demo
      </p>
      <h1>Canvas content survives the drag-image clone</h1>
      <p>
        Drag the analytics card. Its floating drag image should retain the painted chart instead of showing a blank canvas.
      </p>
    </header>

    <div class="canvas-demo__layout">
      <section>
        <div class="section-heading">
          <div>
            <span class="label">Source</span>
            <h2>Weekly performance</h2>
          </div>
          <button type="button" @click="redrawChart">
            Redraw chart
          </button>
        </div>

        <Drag
          class="report-card"
          type="canvas-report"
          :data="report"
          go-back
          @dragstart="status = 'Dragging — the floating chart should remain visible'"
          @dragend="onDragEnd"
        >
          <div class="report-card__summary">
            <span>
              <small>Conversion rate</small>
              <strong>{{ report.value }}</strong>
            </span>
            <span class="change">{{ report.change }}</span>
          </div>
          <canvas
            ref="chartCanvas"
            width="640"
            height="280"
            aria-label="Painted weekly conversion chart"
          >
            Weekly conversion chart
          </canvas>
          <small class="report-card__hint">The chart is painted pixels, not DOM content.</small>
        </Drag>
      </section>

      <section>
        <span class="label">Target</span>
        <Drop
          class="drop-target"
          accepts-type="canvas-report"
          @drop="onDrop"
        >
          <strong>Drop the report here</strong>
          <span>{{ status }}</span>
        </Drop>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Drag from '../lib/src/components/Drag.vue';
import Drop from '../lib/src/components/Drop.vue';
import '../lib/src/js/DragImagesManager';
import type { DnDEventPayload } from '../lib/src/types';

const report = {
  title: 'Weekly performance',
  value: '8.4%',
  change: '+14.2%'
};
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const status = ref('Waiting for the canvas card');
let chartVersion = 0;

const drawChart = () => {
  const canvas = chartCanvas.value;
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;

  const width = canvas.width;
  const height = canvas.height;
  const values = chartVersion % 2 === 0
    ? [184, 158, 168, 112, 126, 72, 48]
    : [198, 170, 132, 148, 96, 86, 42];
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#8b5cf6');
  gradient.addColorStop(1, '#22d3ee');

  context.clearRect(0, 0, width, height);
  context.fillStyle = '#0f172a';
  context.fillRect(0, 0, width, height);

  context.strokeStyle = 'rgba(148, 163, 184, 0.18)';
  context.lineWidth = 1;
  for (let y = 40; y < height; y += 48) {
    context.beginPath();
    context.moveTo(28, y);
    context.lineTo(width - 28, y);
    context.stroke();
  }

  context.beginPath();
  values.forEach((value, index) => {
    const x = 32 + index * ((width - 64) / (values.length - 1));
    if (index === 0) context.moveTo(x, value);
    else context.lineTo(x, value);
  });
  context.strokeStyle = gradient;
  context.lineWidth = 8;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.stroke();

  values.forEach((value, index) => {
    const x = 32 + index * ((width - 64) / (values.length - 1));
    context.beginPath();
    context.arc(x, value, 8, 0, Math.PI * 2);
    context.fillStyle = '#f8fafc';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = index === values.length - 1 ? '#22d3ee' : '#8b5cf6';
    context.stroke();
  });
};

const redrawChart = () => {
  chartVersion++;
  drawChart();
  status.value = 'Chart repainted — drag it to snapshot the new pixels';
};
const onDrop = (event: DnDEventPayload) => {
  const droppedReport = event.data as typeof report;
  status.value = `Received ${droppedReport.title}`;
};
const onDragEnd = (event: DnDEventPayload) => {
  if (!event.success) status.value = 'Returned to source — try the target';
};

onMounted(drawChart);
</script>

<style scoped>
.canvas-demo {
  min-height: 100vh;
  padding: clamp(2rem, 6vw, 5rem);
  background: #070b18;
  color: #e2e8f0;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.canvas-demo__header {
  max-width: 52rem;
  margin: 0 auto 3rem;
}

.canvas-demo__header h1 {
  margin: 0.35rem 0 0.75rem;
  color: white;
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.05;
}

.canvas-demo__header > p:last-child {
  max-width: 44rem;
  color: #94a3b8;
  font-size: 1.05rem;
  line-height: 1.65;
}

.eyebrow,
.label {
  color: #67e8f9;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.canvas-demo__layout {
  display: grid;
  max-width: 70rem;
  margin: 0 auto;
  grid-template-columns: minmax(0, 1.35fr) minmax(16rem, 0.65fr);
  gap: 2rem;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-heading h2 {
  margin: 0.25rem 0 0;
  color: white;
}

.section-heading button {
  padding: 0.55rem 0.8rem;
  border: 1px solid #334155;
  border-radius: 0.55rem;
  background: #111827;
  color: #cbd5e1;
  cursor: pointer;
}

.report-card {
  padding: 1.2rem;
  border: 1px solid #334155;
  border-radius: 1rem;
  background: #111827;
  box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.35);
  cursor: grab;
  user-select: none;
}

.report-card__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.report-card__summary small,
.report-card__summary strong {
  display: block;
}

.report-card__summary small,
.report-card__hint {
  color: #94a3b8;
}

.report-card__summary strong {
  margin-top: 0.15rem;
  color: white;
  font-size: 2rem;
}

.change {
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  background: rgba(34, 211, 238, 0.12);
  color: #67e8f9;
  font-weight: 700;
}

.report-card canvas {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 0.75rem;
}

.report-card__hint {
  display: block;
  margin-top: 0.75rem;
}

.drop-target {
  display: grid;
  min-height: 22rem;
  margin-top: 1rem;
  place-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 2px dashed #475569;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.75);
  color: #94a3b8;
  text-align: center;
  transition: 150ms ease;
}

.drop-target strong {
  color: white;
  font-size: 1.1rem;
}

.drop-target.drop-in.drop-allowed {
  border-color: #22d3ee;
  background: rgba(34, 211, 238, 0.12);
  transform: translateY(-2px);
}

@media (max-width: 760px) {
  .canvas-demo__layout {
    grid-template-columns: 1fr;
  }

  .drop-target {
    min-height: 12rem;
  }
}
</style>
