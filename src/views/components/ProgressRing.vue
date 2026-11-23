<template>
  <div class="progress-ring">
    <svg
      :width="size"
      :height="size"
      :viewBox="`${-size / 2} ${-size / 2} ${size} ${size}`"
      aria-hidden="true"
    >
      <g transform="rotate(-90)" fill="none" :stroke-linecap="lineCap">
        <template v-if="scaleColor">
          <line
            v-for="tick in ticks"
            :key="tick.angle"
            :x1="size / 2 - scaleLength"
            :x2="size / 2 - scaleLength + tick.length"
            :transform="`rotate(${tick.angle})`"
            :stroke="scaleColor"
            stroke-width="1"
            stroke-linecap="butt"
          />
        </template>
        <circle :r="radius" :stroke="trackColor" :stroke-width="lineWidth" />
        <circle
          v-if="fraction > 0"
          class="bar"
          :r="radius"
          :stroke="barColor"
          :stroke-width="lineWidth"
          pathLength="100"
          stroke-dasharray="100"
          :stroke-dashoffset="100 - fraction * 100"
        />
      </g>
    </svg>
    <div
      class="inner-text"
      :style="{ fontSize: fontSize, lineHeight: size + 'px' }"
    >
      <slot> {{ percent }}% </slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    barColor: String,
    trackColor: String,
    scaleColor: String,
    scaleLength: { type: Number, default: 5 },
    lineCap: { type: String, default: 'round' },
    lineWidth: { type: Number, required: true },
    size: { type: Number, required: true },
    fontSize: { type: String, default: '20px' },
    percent: { type: Number, required: true },
  },
  computed: {
    fraction() {
      return Math.min(Math.max(this.percent / 100, 0), 1);
    },
    radius() {
      const r = (this.size - this.lineWidth) / 2 - 1;
      return Math.max(0, this.scaleColor ? r - this.scaleLength - 2 : r);
    },
    ticks() {
      return Array.from({ length: 24 }, (_, i) => ({
        angle: i * 15,
        length: i % 6 === 0 ? this.scaleLength : this.scaleLength * 0.6,
      }));
    },
  },
};
</script>

<style scoped>
.progress-ring {
  position: relative;
  text-align: center;
}
.progress-ring .inner-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  display: block;
}
.bar {
  animation: fill 1s ease-in-out;
  transition: stroke-dashoffset 1s ease-in-out;
}
@keyframes fill {
  from {
    stroke-dashoffset: 100;
  }
}
@media (prefers-reduced-motion: reduce) {
  .bar {
    animation: none;
    transition: none;
  }
}
</style>
