<template>
  <div>
    <b-card :no-body="true" class="mb-3">
      <b-card-body v-if="run" class="p-3 clearfix">
        <i class="fa fa-random bg-primary p-3 font-2xl mr-3 float-left"></i>
        <div class="h5 mb-0 mt-1">
          {{ run.workflow_name }}
          <span class="text-muted font-weight-normal">
            v{{ run.workflow_version }}
          </span>
          <b-badge
            :variant="statusVariant(normalizedStatus)"
            class="ml-2 align-middle"
          >
            <i :class="'fa ' + statusIcon(normalizedStatus)"></i>
            {{ statusLabel(normalizedStatus) }}
          </b-badge>
        </div>
        <div class="text-muted font-xs mt-1">
          <div>
            <strong>{{ $t('message.id') }}:</strong> {{ run.id }}
          </div>
          <div v-if="run.workflow_instance_id">
            <strong>{{ $t('admin.workflow_instance_id') }}:</strong>
            {{ run.workflow_instance_id }}
          </div>
        </div>
      </b-card-body>
      <b-card-body v-else class="p-3 text-center">
        <i class="fa fa-spinner fa-spin"></i>
      </b-card-body>
    </b-card>
    <b-row>
      <b-col md="4">
        <b-card v-if="run" :header="$t('admin.workflow_run_details')">
          <b-card-body class="p-2">
            <dl class="run-details mb-0">
              <dt>{{ $t('admin.task_queue_name') }}</dt>
              <dd>{{ run.task_queue_name }}</dd>
              <dt>{{ $t('admin.priority') }}</dt>
              <dd>{{ run.priority }}</dd>
              <template v-if="run.concurrency_key">
                <dt>{{ $t('admin.concurrency_key') }}</dt>
                <dd>{{ run.concurrency_key }}</dd>
              </template>
              <template v-if="run.parent_id">
                <dt>{{ $t('admin.workflow_parent_run') }}</dt>
                <dd>
                  <router-link
                    :to="{
                      name: 'WorkflowRunDetail',
                      params: { id: run.parent_id },
                    }"
                  >
                    {{ run.parent_id }}
                  </router-link>
                </dd>
              </template>
              <template v-if="run.labels && Object.keys(run.labels).length">
                <dt>{{ $t('admin.labels') }}</dt>
                <dd>
                  <router-link
                    v-for="(val, key) in run.labels"
                    :key="key"
                    :to="{
                      name: 'WorkflowRunList',
                      query: { label: `${key}=${val}` },
                    }"
                    class="badge badge-info label-badge mr-1 mb-1"
                    :title="`${key}=${val}`"
                    >{{ key }}={{ val }}</router-link
                  >
                </dd>
              </template>
            </dl>
            <hr class="my-2" />
            <dl class="run-details mb-0">
              <dt>{{ $t('message.created') }}</dt>
              <dd>{{ formatTs(run.created_at) }}</dd>
              <dt>{{ $t('message.started') }}</dt>
              <dd>{{ formatTs(run.started_at) }}</dd>
              <dt>{{ $t('message.updated') }}</dt>
              <dd>{{ formatTs(run.updated_at) }}</dd>
              <dt>{{ $t('message.completed') }}</dt>
              <dd>{{ formatTs(run.completed_at) }}</dd>
            </dl>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col md="8">
        <b-card :header="$t('admin.events')">
          <b-card-body>
            <div v-if="pollTimer" class="text-muted text-center mb-3">
              <i class="fa fa-spinner fa-spin mr-1"></i>
              {{ $t('admin.pending_events') }}
            </div>
            <div
              v-if="events.length === 0 && !loadingEvents"
              class="text-muted text-center"
            >
              {{ $t('admin.no_events') }}
            </div>
            <div
              v-for="event in events"
              :key="event.sequence_number"
              class="event-item mb-3"
              :style="eventBorderStyle(event)"
            >
              <div class="d-flex align-items-center mb-1">
                <span class="font-weight-bold mr-2">{{
                  eventTypeLabel(event)
                }}</span>
                <small class="text-muted ml-auto">{{
                  formatTs(event.event.timestamp)
                }}</small>
              </div>
              <div class="event-body pl-3">
                <template v-if="eventType(event) === 'runCreated'">
                  <div v-if="event.event.runCreated.parentRunId">
                    <strong>{{ $t('admin.workflow_parent_run') }}:</strong>
                    <router-link
                      :to="{
                        name: 'WorkflowRunDetail',
                        params: { id: event.event.runCreated.parentRunId },
                      }"
                    >
                      {{ event.event.runCreated.parentRunId }}
                    </router-link>
                  </div>
                  <collapsible-json
                    v-if="event.event.runCreated.argument"
                    :label="$t('admin.argument')"
                    :data="event.event.runCreated.argument"
                  />
                </template>

                <template v-else-if="eventType(event) === 'runCanceled'">
                  <div v-if="event.event.runCanceled.reason">
                    <strong>{{ $t('admin.reason') }}:</strong>
                    {{ event.event.runCanceled.reason }}
                  </div>
                </template>

                <template v-else-if="eventType(event) === 'runCompleted'">
                  <collapsible-json
                    v-if="event.event.runCompleted.result"
                    :label="$t('admin.result')"
                    :data="event.event.runCompleted.result"
                  />
                  <collapsible-json
                    v-if="event.event.runCompleted.failure"
                    :label="$t('admin.failure')"
                    variant="danger"
                    :data="event.event.runCompleted.failure"
                  />
                </template>

                <template
                  v-else-if="eventType(event) === 'activityTaskCreated'"
                >
                  <div>
                    <strong>{{ $t('admin.activity') }}:</strong>
                    {{ event.event.activityTaskCreated.name }}
                  </div>
                  <div v-if="event.event.activityTaskCreated.queueName">
                    <strong>{{ $t('admin.queue') }}:</strong>
                    {{ event.event.activityTaskCreated.queueName }}
                  </div>
                  <div
                    v-if="
                      event.event.activityTaskCreated.priority !== undefined
                    "
                  >
                    <strong>{{ $t('admin.priority') }}:</strong>
                    {{ event.event.activityTaskCreated.priority }}
                  </div>
                  <collapsible-json
                    v-if="event.event.activityTaskCreated.argument"
                    :label="$t('admin.argument')"
                    :data="event.event.activityTaskCreated.argument"
                  />
                </template>

                <template
                  v-else-if="eventType(event) === 'activityTaskCompleted'"
                >
                  <collapsible-json
                    v-if="event.event.activityTaskCompleted.result"
                    :label="$t('admin.result')"
                    :data="event.event.activityTaskCompleted.result"
                  />
                </template>

                <template v-else-if="eventType(event) === 'activityTaskFailed'">
                  <div
                    v-if="event.event.activityTaskFailed.attempts !== undefined"
                  >
                    <strong>{{ $t('admin.attempts') }}:</strong>
                    {{ event.event.activityTaskFailed.attempts }}
                  </div>
                  <collapsible-json
                    v-if="event.event.activityTaskFailed.failure"
                    :label="$t('admin.failure')"
                    variant="danger"
                    :data="event.event.activityTaskFailed.failure"
                  />
                </template>

                <template v-else-if="eventType(event) === 'childRunCreated'">
                  <div v-if="event.event.childRunCreated.id">
                    <strong>{{ $t('admin.workflow_child_run') }}:</strong>
                    <router-link
                      :to="{
                        name: 'WorkflowRunDetail',
                        params: { id: event.event.childRunCreated.id },
                      }"
                    >
                      {{ event.event.childRunCreated.id }}
                    </router-link>
                  </div>
                  <div v-if="event.event.childRunCreated.workflowName">
                    <strong>{{ $t('admin.workflow') }}:</strong>
                    {{ event.event.childRunCreated.workflowName }}
                  </div>
                  <div v-if="event.event.childRunCreated.queueName">
                    <strong>{{ $t('admin.queue') }}:</strong>
                    {{ event.event.childRunCreated.queueName }}
                  </div>
                  <div
                    v-if="event.event.childRunCreated.priority !== undefined"
                  >
                    <strong>{{ $t('admin.priority') }}:</strong>
                    {{ event.event.childRunCreated.priority }}
                  </div>
                  <div v-if="event.event.childRunCreated.concurrencyKey">
                    <strong>{{ $t('admin.concurrency_key') }}:</strong>
                    {{ event.event.childRunCreated.concurrencyKey }}
                  </div>
                </template>

                <template v-else-if="eventType(event) === 'childRunCompleted'">
                  <collapsible-json
                    v-if="event.event.childRunCompleted.result"
                    :label="$t('admin.result')"
                    :data="event.event.childRunCompleted.result"
                  />
                </template>

                <template v-else-if="eventType(event) === 'childRunFailed'">
                  <collapsible-json
                    v-if="event.event.childRunFailed.failure"
                    :label="$t('admin.failure')"
                    variant="danger"
                    :data="event.event.childRunFailed.failure"
                  />
                </template>

                <template v-else-if="eventType(event) === 'timerCreated'">
                  <div v-if="event.event.timerCreated.timerName">
                    <strong>{{ $t('admin.timer') }}:</strong>
                    {{ event.event.timerCreated.timerName }}
                  </div>
                  <div v-if="event.event.timerCreated.elapseAt">
                    <strong>{{ $t('admin.elapse_at') }}:</strong>
                    {{ formatTs(event.event.timerCreated.elapseAt) }}
                  </div>
                </template>

                <template v-else-if="eventType(event) === 'sideEffectExecuted'">
                  <div v-if="event.event.sideEffectExecuted.name">
                    <strong>{{ $t('message.name') }}:</strong>
                    {{ event.event.sideEffectExecuted.name }}
                  </div>
                  <collapsible-json
                    v-if="event.event.sideEffectExecuted.result"
                    :label="$t('admin.result')"
                    :data="event.event.sideEffectExecuted.result"
                  />
                </template>

                <template
                  v-else-if="eventType(event) === 'externalEventReceived'"
                >
                  <div v-if="event.event.externalEventReceived.id">
                    <strong>{{ $t('message.id') }}:</strong>
                    {{ event.event.externalEventReceived.id }}
                  </div>
                  <collapsible-json
                    v-if="event.event.externalEventReceived.payload"
                    :label="$t('admin.payload')"
                    :data="event.event.externalEventReceived.payload"
                  />
                </template>
              </div>
            </div>
            <div v-if="loadingEvents" class="text-center my-3">
              <i class="fa fa-spinner fa-spin"></i>
            </div>
            <div
              v-if="nextPageToken && !loadingEvents"
              class="text-center mt-3"
            >
              <b-button variant="outline-primary" size="sm" @click="loadMore">
                {{ $t('admin.load_more') }}
              </b-button>
            </div>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import common from '@/shared/common';

const CollapsibleJson = {
  props: {
    label: { type: String, required: true },
    data: { type: [Object, String, Array], default: null },
    variant: { type: String, default: null },
  },
  data() {
    return { expanded: false };
  },
  computed: {
    formatted() {
      if (typeof this.data === 'string') {
        return this.data;
      }
      try {
        return JSON.stringify(this.data, null, 2);
      } catch {
        return String(this.data);
      }
    },
    labelClass() {
      return this.variant === 'danger' ? 'text-danger' : '';
    },
  },
  template: `
    <div class="collapsible-json mt-1">
      <a href="#" class="collapsible-toggle" :class="labelClass" @click.prevent="expanded = !expanded">
        <i class="fa" :class="expanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
        {{ label }}
      </a>
      <pre v-if="expanded" class="event-json mt-1">{{ formatted }}</pre>
    </div>
  `,
};

const TERMINAL_STATUSES = ['COMPLETED', 'FAILED', 'CANCELLED'];
const POLL_INTERVAL_MS = 5000;
const EVENT_LIMIT = 10;
const POLL_LIMIT = 50;

const BADGE_COLORS = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

const EVENT_TYPES = [
  'workflowTaskStarted',
  'workflowTaskCompleted',
  'runCreated',
  'runStarted',
  'runSuspended',
  'runResumed',
  'runCanceled',
  'runCompleted',
  'activityTaskCreated',
  'activityTaskCompleted',
  'activityTaskFailed',
  'childRunCreated',
  'childRunCompleted',
  'childRunFailed',
  'timerCreated',
  'timerElapsed',
  'sideEffectExecuted',
  'externalEventReceived',
];

const REFERENCE_FIELDS = {
  activityTaskCompleted: 'activityTaskCreatedEventId',
  activityTaskFailed: 'activityTaskCreatedEventId',
  childRunCompleted: 'childRunCreatedEventId',
  childRunFailed: 'childRunCreatedEventId',
  timerElapsed: 'timerCreatedEventId',
};

export default {
  components: {
    CollapsibleJson,
  },
  props: {
    id: { type: [String, Number], required: true },
  },
  data() {
    return {
      run: null,
      events: [],
      nextPageToken: null,
      loadingEvents: false,
      pollTimer: null,
      maxSeqNum: 0,
    };
  },
  computed: {
    runUrl() {
      return `${this.$api.BASE_URL}/api/v2/internal/workflow-runs/${encodeURIComponent(this.id)}`;
    },
    normalizedStatus() {
      if (!this.run) {
        return null;
      }
      return this.normalizeStatus(this.run.status);
    },
    isTerminal() {
      return (
        this.normalizedStatus !== null &&
        TERMINAL_STATUSES.includes(this.normalizedStatus)
      );
    },
  },
  mounted() {
    this.fetchRun();
    this.fetchEvents();
  },
  beforeDestroy() {
    this.stopPolling();
  },
  watch: {
    id() {
      this.stopPolling();
      this.run = null;
      this.events = [];
      this.nextPageToken = null;
      this.maxSeqNum = 0;
      this.fetchRun();
      this.fetchEvents();
    },
  },
  methods: {
    async fetchRun() {
      try {
        const response = await this.axios.get(this.runUrl);
        const wasTerminal = this.isTerminal;
        this.run = response.data;
        if (!this.isTerminal && !this.pollTimer) {
          this.startPolling();
        } else if (this.isTerminal && !wasTerminal) {
          await this.pollNewEvents();
          this.stopPolling();
        }
      } catch (e) {
        console.error('Failed to fetch workflow run', e);
      }
    },
    async fetchEvents() {
      this.loadingEvents = true;
      try {
        const response = await this.axios.get(`${this.runUrl}/events`, {
          params: { sort_direction: 'DESC', limit: EVENT_LIMIT },
        });
        this.events = response.data.items || [];
        this.updateMaxSeqNum(this.events);
        this.nextPageToken = response.data.next_page_token;
      } catch (e) {
        console.error('Failed to fetch workflow run events', e);
      } finally {
        this.loadingEvents = false;
      }
    },
    async loadMore() {
      if (!this.nextPageToken || this.loadingEvents) {
        return;
      }
      this.loadingEvents = true;
      try {
        const response = await this.axios.get(`${this.runUrl}/events`, {
          params: {
            sort_direction: 'DESC',
            limit: EVENT_LIMIT,
            page_token: this.nextPageToken,
          },
        });
        const newEvents = response.data.items || [];
        this.events = this.events.concat(newEvents);
        this.updateMaxSeqNum(newEvents);
        this.nextPageToken = response.data.next_page_token;
      } catch (e) {
        console.error('Failed to load more workflow run events', e);
      } finally {
        this.loadingEvents = false;
      }
    },
    startPolling() {
      this.pollTimer = setInterval(() => {
        this.pollNewEvents();
        this.fetchRun();
      }, POLL_INTERVAL_MS);
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    async pollNewEvents() {
      if (this.maxSeqNum <= 0) {
        await this.fetchEvents();
        return;
      }
      try {
        const response = await this.axios.get(`${this.runUrl}/events`, {
          params: {
            from_sequence_number: this.maxSeqNum,
            sort_direction: 'DESC',
            limit: POLL_LIMIT,
          },
        });
        const newEvents = (response.data.items || []).filter(
          (e) => e.sequence_number > this.maxSeqNum,
        );
        if (newEvents.length > 0) {
          newEvents.sort((a, b) => b.sequence_number - a.sequence_number);
          this.events = newEvents.concat(this.events);
          this.updateMaxSeqNum(newEvents);
        }
      } catch (e) {
        console.error('Failed to poll for new workflow run events', e);
      }
    },
    updateMaxSeqNum(events) {
      for (const e of events) {
        if (e.sequence_number > this.maxSeqNum) {
          this.maxSeqNum = e.sequence_number;
        }
      }
    },
    formatTs(value) {
      return value ? common.formatTimestamp(value, true) : '-';
    },
    normalizeStatus(status) {
      if (!status) {
        return status;
      }
      return status.replace(/^WORKFLOW_RUN_STATUS_/, '');
    },
    statusIcon(status) {
      const icons = {
        CANCELLED: 'fa-ban',
        FAILED: 'fa-fire',
        SUSPENDED: 'fa-pause',
        RUNNING: 'fa-play',
        CREATED: 'fa-hourglass-start',
        COMPLETED: 'fa-check',
      };
      return icons[status] || 'fa-question';
    },
    statusVariant(status) {
      const variants = {
        CANCELLED: 'warning',
        FAILED: 'danger',
        RUNNING: 'secondary',
        COMPLETED: 'success',
      };
      return variants[status] || 'primary';
    },
    statusLabel(status) {
      if (!status) return '';
      return this.$t(`message.status_${status.toLowerCase()}`);
    },
    eventType(event) {
      const fields = Object.keys(event.event);
      for (const type of EVENT_TYPES) {
        if (fields.includes(type)) {
          return type;
        }
      }
      return null;
    },
    eventTypeLabel(event) {
      switch (this.eventType(event)) {
        case 'workflowTaskStarted':
          return this.$t('admin.workflow_event_workflow_task_started');
        case 'workflowTaskCompleted':
          return this.$t('admin.workflow_event_workflow_task_completed');
        case 'runCreated':
          return this.$t('admin.workflow_event_run_created');
        case 'runStarted':
          return this.$t('admin.workflow_event_run_started');
        case 'runSuspended':
          return this.$t('admin.workflow_event_run_suspended');
        case 'runResumed':
          return this.$t('admin.workflow_event_run_resumed');
        case 'runCanceled':
          return this.$t('admin.workflow_event_run_canceled');
        case 'runCompleted':
          return this.$t('admin.workflow_event_run_completed');
        case 'activityTaskCreated':
          return this.$t('admin.workflow_event_activity_task_created');
        case 'activityTaskCompleted':
          return this.$t('admin.workflow_event_activity_task_completed');
        case 'activityTaskFailed':
          return this.$t('admin.workflow_event_activity_task_failed');
        case 'childRunCreated':
          return this.$t('admin.workflow_event_child_run_created');
        case 'childRunCompleted':
          return this.$t('admin.workflow_event_child_run_completed');
        case 'childRunFailed':
          return this.$t('admin.workflow_event_child_run_failed');
        case 'timerCreated':
          return this.$t('admin.workflow_event_timer_created');
        case 'timerElapsed':
          return this.$t('admin.workflow_event_timer_elapsed');
        case 'sideEffectExecuted':
          return this.$t('admin.workflow_event_side_effect_executed');
        case 'externalEventReceived':
          return this.$t('admin.workflow_event_external_event_received');
        default:
          return this.$t('admin.workflow_event_type_unknown');
      }
    },
    eventCorrelationId(event) {
      const e = event.event;
      if (e.id !== undefined && e.id !== -1) {
        return e.id;
      }
      const type = this.eventType(event);
      if (!type || !REFERENCE_FIELDS[type]) {
        return null;
      }
      const refField = REFERENCE_FIELDS[type];
      const eventData = e[type];
      if (eventData && eventData[refField] != null) {
        return eventData[refField];
      }
      return null;
    },
    eventBorderStyle(event) {
      const id = this.eventCorrelationId(event);
      if (id === null || typeof id !== 'number') {
        return {};
      }
      const color = BADGE_COLORS[Math.abs(id) % BADGE_COLORS.length];
      return { borderLeftColor: color };
    },
  },
};
</script>

<style scoped>
.event-item {
  border-left: 3px solid #e0e0e0;
  padding-left: 0.75rem;
}

.run-details dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9e9e9e;
  margin-bottom: 0;
}

.run-details dd {
  margin-bottom: 0.5rem;
}

.label-badge {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
  cursor: pointer;
}
</style>

<style>
.collapsible-toggle {
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
}

.collapsible-toggle .fa {
  font-size: 0.7rem;
  margin-right: 0.25rem;
}

.event-json {
  font-size: 0.8rem;
  max-height: 300px;
  overflow: auto;
}
</style>
