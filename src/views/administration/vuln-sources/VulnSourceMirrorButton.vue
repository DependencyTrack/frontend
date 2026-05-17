<template>
  <span class="ml-2 text-nowrap">
    <span
      v-b-tooltip.hover.focus
      :title="tooltipTitle"
      :tabindex="disabled ? 0 : -1"
      class="d-inline-block"
    >
      <b-button
        :variant="buttonVariant"
        :disabled="disabled"
        :aria-busy="busy ? 'true' : 'false'"
        :style="disabled ? 'pointer-events: none;' : ''"
        @click="triggerMirror"
      >
        <b-spinner v-if="busy" small :label="$t('message.loading')" />
        <i v-else class="fa fa-refresh" />
        {{ $t('admin.vuln_source_mirror_now') }}
      </b-button>
    </span>
    <b-badge v-if="failed" variant="danger" class="ml-2">
      {{
        $t('admin.vuln_source_mirror_status_failed', {
          relative: lastRunRelative,
        })
      }}
    </b-badge>
    <small v-else-if="inProgress" class="ml-2 text-muted">
      {{
        $t('admin.vuln_source_mirror_status_running', {
          relative: lastRunRelative,
        })
      }}
    </small>
    <small v-else-if="status === 'COMPLETED'" class="ml-2 text-muted">
      {{
        $t('admin.vuln_source_mirror_status_completed', {
          relative: lastRunRelative,
        })
      }}
    </small>
  </span>
</template>

<script>
import common from '@/shared/common';
import permissionsMixin from '@/mixins/permissionsMixin';

export default {
  name: 'VulnSourceMirrorButton',
  mixins: [permissionsMixin],
  props: {
    extensionName: { type: String, required: true },
    operationInProgress: { type: Boolean, default: false },
    hasUnsavedChanges: { type: Boolean, default: false },
  },
  data() {
    return {
      status: null,
      startedAt: null,
      completedAt: null,
      failureReason: null,
      triggering: false,
      pollTimer: null,
      nowTick: Date.now(),
      abortController: null,
    };
  },
  computed: {
    inProgress() {
      return this.status === 'PENDING' || this.status === 'RUNNING';
    },
    failed() {
      return this.status === 'FAILED';
    },
    busy() {
      return this.inProgress || this.triggering;
    },
    disabled() {
      const canMirror = this.isPermitted([
        this.PERMISSIONS.SYSTEM_CONFIGURATION,
        this.PERMISSIONS.SYSTEM_CONFIGURATION_UPDATE,
      ]);
      return (
        !canMirror ||
        this.hasUnsavedChanges ||
        this.operationInProgress ||
        this.busy
      );
    },
    buttonVariant() {
      if (this.failed) return 'outline-danger';
      if (this.busy) return 'outline-info';
      return 'outline-secondary';
    },
    lastRunRelative() {
      const ref = this.inProgress ? this.startedAt : this.completedAt;
      if (!ref) return '';
      return common.formatRelative(this.nowTick - ref, this.$t.bind(this));
    },
    tooltipTitle() {
      const fmt = (ts) => (ts ? common.formatTimestamp(ts, true) : '?');
      if (this.hasUnsavedChanges) {
        return this.$t('message.save_changes_first');
      }
      if (this.inProgress) {
        return this.$t('admin.vuln_source_mirror_running', {
          startedAt: fmt(this.startedAt),
        });
      }
      if (this.failed) {
        return this.$t('admin.vuln_source_mirror_failed', {
          relative: this.lastRunRelative || '?',
          completedAt: fmt(this.completedAt),
          reason:
            this.failureReason ||
            this.$t('admin.vuln_source_mirror_unknown_reason'),
        });
      }
      if (this.status === 'COMPLETED') {
        return this.$t('admin.vuln_source_mirror_completed', {
          completedAt: fmt(this.completedAt),
        });
      }
      return '';
    },
  },
  watch: {
    extensionName() {
      this.status = null;
      this.startedAt = null;
      this.completedAt = null;
      this.failureReason = null;
      this.stopPolling();
      this.fetchStatus();
    },
  },
  mounted() {
    this.fetchStatus();
  },
  beforeDestroy() {
    this.stopPolling();
    this.abortController?.abort();
  },
  methods: {
    async fetchStatus() {
      this.abortController?.abort();
      const controller = new AbortController();
      this.abortController = controller;
      try {
        const response = await this.axios.get(
          `${this.$api.BASE_URL}/api/v2/vuln-data-sources/${encodeURIComponent(
            this.extensionName,
          )}/mirror-runs/latest`,
          {
            signal: controller.signal,
            validateStatus: (s) => s === 200 || s === 404,
          },
        );
        const payload = response.status === 404 ? {} : response.data || {};
        this.status = payload.status || null;
        this.startedAt = payload.started_at || null;
        this.completedAt = payload.completed_at || null;
        this.failureReason = payload.failure_reason || null;
        this.nowTick = Date.now();
        if (this.inProgress) this.schedulePoll();
        else this.stopPolling();
        return 'ok';
      } catch (error) {
        if (controller.signal.aborted || this.axios.isCancel?.(error)) {
          return 'aborted';
        }
        console.error('Failed to fetch mirror status:', error);
        return 'error';
      }
    },
    async triggerMirror() {
      if (this.disabled) return;
      this.triggering = true;
      try {
        await this.axios.post(
          `${this.$api.BASE_URL}/api/v2/vuln-data-sources/${encodeURIComponent(
            this.extensionName,
          )}/mirror-runs`,
          null,
          { validateStatus: (s) => s === 202 },
        );
        this.$toastr.s(this.$t('admin.vuln_source_mirror_started'));
        // Optimistically reflect the queued run so the button stays disabled
        // and polling keeps running even if the immediate refresh fails.
        this.status = 'PENDING';
        this.startedAt = Date.now();
        this.nowTick = Date.now();
        this.schedulePoll();
        void this.fetchStatus();
      } catch (error) {
        console.error('Failed to trigger mirror:', error);
      } finally {
        this.triggering = false;
      }
    },
    schedulePoll() {
      if (this.pollTimer) return;
      this.pollTimer = setTimeout(async () => {
        this.pollTimer = null;
        if (!this.inProgress) return;
        const prevStatus = this.status;
        const result = await this.fetchStatus();
        if (result === 'aborted') return;
        if (result === 'error') {
          if (this.inProgress) this.schedulePoll();
          return;
        }
        const wasInProgress =
          prevStatus === 'PENDING' || prevStatus === 'RUNNING';
        if (wasInProgress && this.status === 'COMPLETED') {
          this.$toastr.s(this.$t('admin.vuln_source_mirror_finished_success'));
        } else if (wasInProgress && this.status === 'FAILED') {
          this.$toastr.e(this.$t('admin.vuln_source_mirror_finished_failure'));
        }
      }, 5000);
    },
    stopPolling() {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer);
        this.pollTimer = null;
      }
    },
  },
};
</script>
