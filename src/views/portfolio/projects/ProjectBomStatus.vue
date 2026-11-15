<template>
  <div
    v-if="display"
    class="alert d-flex align-items-start gap-3 mb-3"
    :class="`alert-${display.view.variant}`"
    :role="display.view.role"
  >
    <b-spinner
      v-if="display.view.kind === 'running'"
      small
      class="mt-1"
      aria-hidden="true"
    />
    <i
      v-else
      class="fa fa-fw mt-1"
      :class="ICONS[display.view.kind]"
      aria-hidden="true"
    ></i>
    <div class="flex-grow-1">
      <div class="d-flex flex-wrap justify-content-between gap-2">
        <div class="fw-bold">
          <template v-if="display.view.kind === 'queued'">{{
            $t('message.bom_processing_queued_title')
          }}</template>
          <template v-else-if="display.view.kind === 'running'">{{
            $t('message.bom_processing_running_title')
          }}</template>
          <template v-else-if="display.view.kind === 'completed'">{{
            $t('message.bom_processing_completed_title')
          }}</template>
          <template v-else>{{
            $t('message.bom_processing_failed_title')
          }}</template>
        </div>
        <div v-if="display.active" class="text-muted">
          {{ $t('message.bom_processing_started', { time: elapsedText }) }}
        </div>
      </div>
      <div v-if="display.active" class="small mt-1">
        {{ $t('message.bom_processing_leave_hint') }}
      </div>
      <div v-else-if="display.view.kind === 'completed'" class="mt-1">
        {{ $t('message.bom_processing_completed_detail') }}
      </div>
      <template v-else-if="display.view.kind === 'failed'">
        <div class="mt-1">{{ $t('message.bom_processing_failed_detail') }}</div>
        <div class="mt-1">
          {{ $t('message.bom_processing_failed_unchanged') }}
        </div>
        <b-button
          variant="danger"
          class="mt-2"
          @click="$emit('upload-again')"
          >{{ $t('message.bom_upload_again') }}</b-button
        >
      </template>
    </div>
    <button
      v-if="!display.active"
      type="button"
      class="btn-close"
      :aria-label="$t('message.bom_processing_dismiss')"
      @click="dismiss"
    ></button>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  elapsedSince,
  isActiveStatus,
  isTerminalStatus,
  statusView,
} from '@/shared/bomProcessing';
import { acknowledgeBomUpload, bomUploads } from '@/shared/bomUploads';

const props = defineProps({
  uuid: { type: String, required: true },
});
const emit = defineEmits(['completed', 'upload-again']);
const { t } = useI18n();

const ICONS = {
  queued: 'fa-clock-o',
  completed: 'fa-check-circle',
  failed: 'fa-exclamation-circle',
};

const tracked = computed(() => bomUploads[props.uuid]);
// A terminal outcome is acknowledged as soon as it is shown,
// so the banner keeps its own copy until the user dismisses it.
const outcome = ref(null);
const now = ref(Date.now());

const display = computed(() => {
  if (outcome.value) {
    return { view: statusView(outcome.value), active: false };
  }
  const upload = tracked.value;
  if (upload && isActiveStatus(upload.status)) {
    return {
      view: statusView(upload.status),
      active: true,
      startedAt: upload.startedAt,
    };
  }
  return null;
});

const elapsedText = computed(() => {
  const { key, n } = elapsedSince(
    display.value?.startedAt ?? now.value,
    now.value,
  );
  return t(`message.${key}`, { n });
});

watch(
  () => tracked.value?.status,
  (status) => {
    if (isTerminalStatus(status)) {
      outcome.value = status;
      acknowledgeBomUpload(props.uuid);
      if (status === 'COMPLETED') emit('completed');
    } else if (isActiveStatus(status)) {
      // A new upload replaces the outcome of the previous one.
      outcome.value = null;
    }
  },
  { immediate: true },
);

function dismiss() {
  outcome.value = null;
}

let tick;
onMounted(() => {
  tick = setInterval(() => (now.value = Date.now()), 1000);
});
onBeforeUnmount(() => clearInterval(tick));
</script>
