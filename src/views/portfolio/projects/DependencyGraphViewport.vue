<template>
  <div
    ref="viewport"
    class="dependency-graph-viewport user-select-none"
    :class="{ dragging, moving: dragging || wheeling }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerEnd"
    @pointercancel="onPointerEnd"
    @wheel="onWheel"
    @dragstart.prevent
    @click.capture="onClickCapture"
    @focusin="onFocusIn"
  >
    <div
      ref="content"
      class="dependency-graph-content"
      :style="{ width: `${width}px`, height: `${height}px` }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
  watchPostEffect,
} from 'vue';
import {
  centerOrClampOffset,
  panToShowRange,
  scaleToFit,
  wheelScrollsPage,
} from './dependencyGraph';

const MIN_SCALE = 0.35;
const MAX_SCALE = 2;
const MIN_READABLE_SCALE = 0.55;
const ZOOM_STEP = 1.25;
const DRAG_THRESHOLD = 4;
const MARGIN = 16;
const WHEEL_END_MILLIS = 150;

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
});
const emit = defineEmits(['view-change']);

const viewport = useTemplateRef('viewport');
const content = useTemplateRef('content');
const x = ref(0);
const y = ref(0);
const scale = ref(1);
const dragging = ref(false);
const wheeling = ref(false);
const transform = computed(
  () => `translate(${x.value}px, ${y.value}px) scale(${scale.value})`,
);

let resizeObserver;
let viewFrame;
let wheelTimer;
let drag;
let suppressClick = false;
let revealTarget;
let revealTransform;

function viewportSize() {
  const { clientWidth, clientHeight } = viewport.value;
  return { width: clientWidth, height: clientHeight };
}

function visibleContentArea() {
  const { width, height } = viewportSize();
  return {
    left: -x.value / scale.value,
    top: -y.value / scale.value,
    right: (width - x.value) / scale.value,
    bottom: (height - y.value) / scale.value,
  };
}

function scheduleViewChange() {
  if (viewFrame) return;
  viewFrame = requestAnimationFrame(() => {
    viewFrame = null;
    emit('view-change', visibleContentArea());
  });
}

function clientToContent(clientX, clientY) {
  const { left, top } = viewport.value.getBoundingClientRect();
  return {
    x: (clientX - left - x.value) / scale.value,
    y: (clientY - top - y.value) / scale.value,
  };
}

function centerAtScale(newScale, center) {
  const { width, height } = viewportSize();
  scale.value = newScale;
  x.value = width / 2 - center.x * newScale;
  y.value = height / 2 - center.y * newScale;
}

function fitOrCenter(target, minFitScale) {
  const fitScale = scaleToFit(
    viewportSize(),
    { width: props.width, height: props.height },
    MARGIN,
  );
  if (fitScale >= minFitScale) {
    centerAtScale(fitScale, { x: props.width / 2, y: props.height / 2 });
  } else {
    centerAtScale(1, target);
    const { width, height } = viewportSize();
    x.value = centerOrClampOffset(x.value, width, props.width, MARGIN);
    y.value = centerOrClampOffset(y.value, height, props.height, MARGIN);
  }
}

function fit(target) {
  fitOrCenter(target, MIN_SCALE);
}

function applyReveal() {
  fitOrCenter(revealTarget, MIN_READABLE_SCALE);
  revealTransform = transform.value;
}

function fitOrCenterOn(target) {
  revealTarget = target;
  applyReveal();
}

function panBy(contentDx, contentDy) {
  x.value += contentDx * scale.value;
  y.value += contentDy * scale.value;
}

function ensureVisible({ left, top, right, bottom }) {
  const { width, height } = viewportSize();
  x.value += panToShowRange(
    left * scale.value + x.value,
    right * scale.value + x.value,
    width,
    MARGIN,
  );
  y.value += panToShowRange(
    top * scale.value + y.value,
    bottom * scale.value + y.value,
    height,
    MARGIN,
  );
}

function zoomBy(factor, originX, originY) {
  const { width, height } = viewportSize();
  const newScale = Math.min(
    Math.max(scale.value * factor, MIN_SCALE),
    MAX_SCALE,
  );
  const applied = newScale / scale.value;
  const pivotX = originX ?? width / 2;
  const pivotY = originY ?? height / 2;
  x.value = pivotX - (pivotX - x.value) * applied;
  y.value = pivotY - (pivotY - y.value) * applied;
  scale.value = newScale;
}

function onWheel(event) {
  const isZoom = event.ctrlKey || event.metaKey;
  const rect = viewport.value.getBoundingClientRect();
  if (!isZoom && wheelScrollsPage(rect, window.innerHeight, event.deltaY)) {
    return;
  }
  event.preventDefault();
  wheeling.value = true;
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => {
    wheeling.value = false;
  }, WHEEL_END_MILLIS);
  const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : 1;
  const deltaX = event.deltaX * unit;
  const deltaY = event.deltaY * unit;
  // Browsers report a trackpad pinch as a wheel event with ctrlKey set.
  if (isZoom) {
    const { left, top } = rect;
    const clamped = Math.min(Math.max(deltaY, -50), 50);
    zoomBy(
      Math.exp(-clamped * 0.01),
      event.clientX - left,
      event.clientY - top,
    );
    return;
  }
  x.value -= event.shiftKey && !deltaX ? deltaY : deltaX;
  y.value -= event.shiftKey ? 0 : deltaY;
}

function onPointerDown(event) {
  if (event.button !== 0) return;
  drag = {
    startX: event.clientX,
    startY: event.clientY,
    x: x.value,
    y: y.value,
  };
}

function onPointerMove(event) {
  if (!drag) return;
  const dx = event.clientX - drag.startX;
  const dy = event.clientY - drag.startY;
  if (!dragging.value) {
    if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    // Capturing only now, since capturing on pointerdown would retarget clicks on links and buttons.
    viewport.value.setPointerCapture(event.pointerId);
    dragging.value = true;
  }
  x.value = drag.x + dx;
  y.value = drag.y + dy;
}

function onPointerEnd() {
  suppressClick = dragging.value;
  dragging.value = false;
  drag = null;
}

function onClickCapture(event) {
  if (suppressClick) {
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }
}

function onFocusIn(event) {
  // Pressing a partly hidden node would otherwise move it away from under the pointer.
  if (!event.target.matches(':focus-visible')) return;
  const { left, top, right, bottom } = event.target.getBoundingClientRect();
  const start = clientToContent(left, top);
  const end = clientToContent(right, bottom);
  ensureVisible({ left: start.x, top: start.y, right: end.x, bottom: end.y });
}

watch([x, y, scale], scheduleViewChange);
// Binding these in the template would re-render the slot on every frame of a pan.
watchPostEffect(() => {
  const { style } = content.value;
  style.transform = transform.value;
  style.setProperty('--graph-zoom', scale.value);
});

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    // The viewport can still change size, e.g. while hidden, until the user takes over.
    if (revealTransform === transform.value) applyReveal();
    scheduleViewChange();
  });
  resizeObserver.observe(viewport.value);
});

onBeforeUnmount(() => {
  resizeObserver.disconnect();
  cancelAnimationFrame(viewFrame);
  clearTimeout(wheelTimer);
});

defineExpose({
  centerAtScale,
  dragging,
  ensureVisible,
  fit,
  fitOrCenterOn,
  panBy,
  visibleContentArea,
  zoomIn: (target) =>
    zoomBy(
      ZOOM_STEP,
      target.x * scale.value + x.value,
      target.y * scale.value + y.value,
    ),
  zoomOut: () => zoomBy(1 / ZOOM_STEP),
});
</script>

<style lang="scss">
.dependency-graph-viewport {
  position: relative;
  height: 100%;
  // Unlike hidden, clip stops the browser from scrolling focused nodes into view behind the transform.
  overflow: clip;
  cursor: grab;
  touch-action: none;
  border-radius: 0 0 var(--bs-border-radius-lg) var(--bs-border-radius-lg);
}
.dependency-graph-viewport.dragging {
  cursor: grabbing;
}
.dependency-graph-content {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}
// Only while moving, since browsers don't redraw such a layer sharply after zooming.
.dependency-graph-viewport.moving .dependency-graph-content {
  will-change: transform;
}
</style>
