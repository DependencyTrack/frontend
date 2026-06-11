<template>
  <b-card no-body :header="$t('admin.workflow_runs')">
    <b-card-body>
      <div
        id="workflowRunToolbar"
        class="filter-bar"
        role="toolbar"
        :aria-label="$t('message.filters')"
      >
        <div class="filter-pills">
          <text-filter-pill
            v-if="isFilterVisible('workflowName')"
            ref="filter_workflowName"
            :field-label="$t('admin.workflow_name')"
            field-name="workflow_name"
            icon="fa-code-fork"
            :operators="['equals']"
            v-model="workflowNameFilter"
            @dismiss="onFilterDismiss('workflowName')"
          />
          <enum-filter-pill
            v-if="isFilterVisible('status')"
            ref="filter_status"
            :field-label="$t('message.status')"
            field-name="status"
            icon="fa-flag"
            :options="statusOptions"
            v-model="statusFilter"
            @dismiss="onFilterDismiss('status')"
          />
          <date-time-range-filter-pill
            v-if="isFilterVisible('created')"
            ref="filter_created"
            :field-label="$t('message.created')"
            field-name="created"
            icon="fa-calendar"
            v-model="createdFilter"
            @dismiss="onFilterDismiss('created')"
          />
          <date-time-range-filter-pill
            v-if="isFilterVisible('completed')"
            ref="filter_completed"
            :field-label="$t('message.completed')"
            field-name="completed"
            icon="fa-calendar-check-o"
            v-model="completedFilter"
            @dismiss="onFilterDismiss('completed')"
          />
          <label-filter-pill
            v-if="isFilterVisible('label')"
            ref="filter_label"
            :field-label="$t('admin.label')"
            field-name="label"
            icon="fa-tag"
            v-model="labelFilter"
            @dismiss="onFilterDismiss('label')"
          />
          <b-dropdown
            v-if="addFilterOptions.length > 0"
            size="sm"
            variant="outline-primary"
            class="btn-more-filters"
            no-caret
          >
            <template #button-content>
              <span class="fa fa-plus" aria-hidden="true"></span>
              {{ $t('message.add_filter') }}
            </template>
            <b-dropdown-item
              v-for="filter in addFilterOptions"
              :key="filter.name"
              @click="showFilter(filter.name)"
              ><span
                :class="['fa', filter.icon, 'mr-2']"
                aria-hidden="true"
              ></span
              >{{ filter.label }}</b-dropdown-item
            >
          </b-dropdown>
          <b-button
            v-show="activeFilterCount >= 2"
            size="sm"
            variant="outline-danger"
            class="btn-clear-all-filters"
            @click="clearAllFilters"
          >
            <span class="fa fa-remove" aria-hidden="true"></span>
            {{ $t('message.clear_all') }}
          </b-button>
        </div>
      </div>
      <token-paginated-table
        ref="table"
        :base-url="tableDataBaseUrl"
        :columns="tableColumns"
        :options="tableOptions"
      />
    </b-card-body>
  </b-card>
</template>
<script>
import DateTimeRangeFilterPill from '@/views/components/DateTimeRangeFilterPill.vue';
import EnumFilterPill from '@/views/components/EnumFilterPill.vue';
import LabelFilterPill from '@/views/components/LabelFilterPill.vue';
import TextFilterPill from '@/views/components/TextFilterPill.vue';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';
import filterPillsMixin from '@/mixins/filterPillsMixin';
import common from '@/shared/common';

export default {
  mixins: [filterPillsMixin],
  components: {
    DateTimeRangeFilterPill,
    EnumFilterPill,
    LabelFilterPill,
    TextFilterPill,
    TokenPaginatedTable,
  },
  data() {
    return {
      workflowNameFilter: null,
      statusFilter: null,
      createdFilter: null,
      completedFilter: null,
      labelFilter: null,
      sortBy: null,
      sortDirection: null,
      statusOptions: [
        { value: 'CANCELLED', text: this.$t(`message.status_canceled`) },
        { value: 'COMPLETED', text: this.$t(`message.status_completed`) },
        { value: 'CREATED', text: this.$t(`message.status_created`) },
        { value: 'FAILED', text: this.$t(`message.status_failed`) },
        { value: 'RUNNING', text: this.$t(`message.status_running`) },
        { value: 'SUSPENDED', text: this.$t(`message.status_suspended`) },
      ],
      tableOptions: {
        toolbar: '#workflowRunToolbar',
        sortName: 'id',
        sortOrder: 'desc',
        // Suppress client-side sorting.
        customSort: () => {},
        onSort: (name, order) => {
          this.sortBy = name;
          this.sortDirection = order;
        },
      },
      tableColumns: [
        {
          title: this.$t('message.id'),
          field: 'id',
          sortable: true,
          formatter: (value) => {
            const href = this.$router.resolve({
              name: 'WorkflowRunDetail',
              params: { id: value },
            }).href;
            return `<a href="${href}">${value}</a>`;
          },
        },
        {
          title: this.$t('admin.workflow_name'),
          field: 'workflow_name',
        },
        {
          title: this.$t('message.status'),
          field: 'status',
          formatter: (value) => {
            let iconName = 'fa-question';
            let textVariant = 'primary';
            if (value === 'CANCELLED') {
              iconName = 'fa-ban';
              textVariant = 'warning';
            } else if (value === 'FAILED') {
              iconName = 'fa-fire';
              textVariant = 'danger';
            } else if (value === 'SUSPENDED') {
              iconName = 'fa-pause';
            } else if (value === 'RUNNING') {
              iconName = 'fa-play';
              textVariant = 'secondary';
            } else if (value === 'CREATED') {
              iconName = 'fa-hourglass-start';
            } else if (value === 'COMPLETED') {
              iconName = 'fa-check';
              textVariant = 'success';
            }
            const i18nValue = this.$t(`message.status_${value.toLowerCase()}`);
            return `<span class="fa ${iconName} text-${textVariant}">&nbsp;</span> ${i18nValue}`;
          },
        },
        {
          title: this.$t('message.created'),
          field: 'created_at',
          sortable: true,
          formatter(value) {
            return value ? common.formatTimestamp(value, true) : '-';
          },
        },
        {
          title: this.$t('message.updated'),
          field: 'updated_at',
          visible: false,
          formatter(value) {
            return value ? common.formatTimestamp(value, true) : '-';
          },
        },
        {
          title: this.$t('message.started'),
          field: 'started_at',
          visible: false,
          formatter(value) {
            return value ? common.formatTimestamp(value, true) : '-';
          },
        },
        {
          title: this.$t('message.completed'),
          field: 'completed_at',
          sortable: true,
          formatter(value) {
            return value ? common.formatTimestamp(value, true) : '-';
          },
        },
      ],
    };
  },
  created() {
    const q = this.$route.query.label;
    if (typeof q === 'string' && q.includes('=')) {
      const eq = q.indexOf('=');
      this.labelFilter = { key: q.slice(0, eq), value: q.slice(eq + 1) };
    }
  },
  computed: {
    allFilterDefs() {
      return [
        {
          name: 'workflowName',
          label: this.$t('admin.workflow_name'),
          icon: 'fa-code-fork',
        },
        { name: 'status', label: this.$t('message.status'), icon: 'fa-flag' },
        {
          name: 'created',
          label: this.$t('message.created'),
          icon: 'fa-calendar',
        },
        {
          name: 'completed',
          label: this.$t('message.completed'),
          icon: 'fa-calendar-check-o',
        },
        {
          name: 'label',
          label: this.$t('admin.label'),
          icon: 'fa-tag',
        },
      ];
    },
    tableDataBaseUrl() {
      const url = `${this.$api.BASE_URL}/api/v2/internal/workflow-runs`;
      const queryParams = {};
      if (
        this.workflowNameFilter &&
        this.workflowNameFilter.value &&
        this.workflowNameFilter.operator === 'equals'
      ) {
        queryParams.workflow_name = this.workflowNameFilter.value;
      }
      if (this.statusFilter) {
        queryParams.status = this.statusFilter;
      }
      if (this.createdFilter) {
        if (this.createdFilter.since) {
          queryParams.created_since = this.createdFilter.since;
        }
        if (this.createdFilter.before) {
          queryParams.created_before = this.createdFilter.before;
        }
      }
      if (this.completedFilter) {
        if (this.completedFilter.since) {
          queryParams.completed_since = this.completedFilter.since;
        }
        if (this.completedFilter.before) {
          queryParams.completed_before = this.completedFilter.before;
        }
      }
      if (this.labelFilter && this.labelFilter.key) {
        queryParams.label = `${this.labelFilter.key}=${this.labelFilter.value ?? ''}`;
      }
      if (this.sortBy) {
        queryParams.sort_by = this.sortBy;
      }
      if (this.sortDirection) {
        queryParams.sort_direction = this.sortDirection.toUpperCase();
      }
      return common.setQueryParams(url, queryParams);
    },
  },
  methods: {
    clearAllFilters() {
      this._clearing = true;
      try {
        this.workflowNameFilter = null;
        this.statusFilter = null;
        this.createdFilter = null;
        this.completedFilter = null;
        this.labelFilter = null;
        this.clearPendingFilters();
      } finally {
        this._clearing = false;
      }
    },
  },
};
</script>

<style scoped src="../../components/filter-pills.css"></style>
