<template>
  <div>
    <b-card no-body>
      <b-tabs
        v-model="tabIndex"
        class="body-bg-color"
        style="border-left: 0; border-right: 0; border-top: 0"
        @input="onTabChange"
      >
        <b-tab>
          <template v-slot:title>
            <i class="fa fa-random"></i>
            {{ $t('admin.task_queue_type_workflow') }}
          </template>
        </b-tab>
        <b-tab>
          <template v-slot:title>
            <i class="fa fa-tasks"></i>
            {{ $t('admin.task_queue_type_activity') }}
          </template>
        </b-tab>
      </b-tabs>
      <b-card-body>
        <token-paginated-table
          ref="table"
          :base-url="tableDataBaseUrl"
          :columns="tableColumns"
          :options="tableOptions"
        />
      </b-card-body>
    </b-card>
    <b-modal
      id="editCapacityModal"
      :title="$t('admin.edit_capacity')"
      @ok.prevent="onCapacityConfirm"
      @shown="$refs.capacityInput.focus()"
    >
      <b-form @submit.prevent="onCapacitySubmit">
        <b-form-group :label="$t('admin.capacity')">
          <b-form-input
            ref="capacityInput"
            type="number"
            min="1"
            v-model.number="editCapacityValue"
          />
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import permissionsMixin from '@/mixins/permissionsMixin';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';
import common from '@/shared/common';
import xssFilters from 'xss-filters';

export default {
  mixins: [permissionsMixin],
  components: {
    TokenPaginatedTable,
  },
  data() {
    return {
      types: ['WORKFLOW', 'ACTIVITY'],
      tabIndex: this.$route.query.type === 'ACTIVITY' ? 1 : 0,
      editCapacityRow: null,
      editCapacityValue: 1,
      tableOptions: {
        showColumns: true,
        showRefresh: true,
        icons: {
          refresh: 'fa-refresh',
        },
      },
      tableColumns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          formatter(value) {
            return xssFilters.inHTMLData(value);
          },
        },
        {
          title: this.$t('message.status'),
          field: 'status',
          formatter: (value) => {
            const isActive = value === 'ACTIVE';
            const variant = isActive ? 'success' : 'warning';
            const icon = isActive ? 'fa-play' : 'fa-pause';
            const label = isActive
              ? this.$t('message.status_active')
              : this.$t('message.status_paused');
            const interactive = this.canUpdate;
            if (interactive) {
              const tooltip = isActive
                ? this.$t('admin.click_to_pause')
                : this.$t('admin.click_to_resume');
              return (
                `<button type="button" class="badge badge-${variant} status-badge status-badge-interactive" ` +
                `title="${xssFilters.inHTMLData(tooltip)}">` +
                `<i class="fa ${icon}"></i> ${label}</button>`
              );
            }
            return `<span class="badge badge-${variant} status-badge"><i class="fa ${icon}"></i> ${label}</span>`;
          },
          events: {
            'click .status-badge-interactive': (_event, _, row) => {
              this.toggleStatus(row);
            },
          },
        },
        {
          title: this.$t('admin.capacity'),
          field: 'capacity',
          formatter: (value) => {
            if (!this.canUpdate) return value;
            const tooltip = xssFilters.inHTMLData(
              this.$t('admin.click_to_edit'),
            );
            return `<button type="button" class="capacity-value" title="${tooltip}">${value} <i class="fa fa-pencil text-muted"></i></button>`;
          },
          events: {
            'click .capacity-value': (_event, _, row) => {
              this.openEditCapacity(row);
            },
          },
        },
        {
          title: this.$t('admin.depth'),
          field: 'depth',
        },
        {
          title: this.$t('message.created'),
          field: 'created_at',
          formatter(value) {
            return value ? common.formatTimestamp(value, true) : '-';
          },
        },
        {
          title: this.$t('message.updated'),
          field: 'updated_at',
          formatter(value) {
            return value ? common.formatTimestamp(value, true) : '-';
          },
        },
      ],
    };
  },
  watch: {
    '$route.query.type'(type) {
      this.tabIndex = type === 'ACTIVITY' ? 1 : 0;
    },
  },
  computed: {
    canUpdate() {
      return (
        this.isPermitted(this.PERMISSIONS.SYSTEM_CONFIGURATION) ||
        this.isPermitted(this.PERMISSIONS.SYSTEM_CONFIGURATION_UPDATE)
      );
    },
    selectedType() {
      return this.types[this.tabIndex];
    },
    tableDataBaseUrl() {
      return `${this.$api.BASE_URL}/api/v2/internal/task-queues/${this.selectedType}`;
    },
  },
  methods: {
    onTabChange(index) {
      const type = this.types[index];
      this.$router.replace({ query: { ...this.$route.query, type } });
    },
    async toggleStatus(row) {
      const newStatus = row.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      await this.axios.patch(
        `${this.$api.BASE_URL}/api/v2/internal/task-queues/${this.selectedType}/${encodeURIComponent(row.name)}`,
        { status: newStatus },
      );
      this.$toastr.s(this.$t('message.updated'));
      this.refreshTable();
    },
    openEditCapacity(row) {
      this.editCapacityRow = row;
      this.editCapacityValue = row.capacity;
      this.$bvModal.show('editCapacityModal');
    },
    async onCapacityConfirm(bvModalEvent) {
      bvModalEvent.preventDefault();
      if (await this.submitCapacity()) {
        this.$bvModal.hide('editCapacityModal');
      }
    },
    async onCapacitySubmit() {
      if (await this.submitCapacity()) {
        this.$bvModal.hide('editCapacityModal');
      }
    },
    async submitCapacity() {
      const row = this.editCapacityRow;
      if (!row || !this.editCapacityValue || this.editCapacityValue < 1) {
        return false;
      }
      try {
        await this.axios.patch(
          `${this.$api.BASE_URL}/api/v2/internal/task-queues/${this.selectedType}/${encodeURIComponent(row.name)}`,
          { capacity: this.editCapacityValue },
        );
        this.$toastr.s(this.$t('message.updated'));
        this.refreshTable();
        return true;
      } catch {
        return false;
      }
    },
    refreshTable() {
      this.$refs.table.refreshCurrentPage();
    },
  },
};
</script>

<style scoped>
::v-deep .status-badge {
  font-size: 0.85em;
  padding: 0.35em 0.65em;
}
::v-deep button.status-badge-interactive {
  border: none;
  font: inherit;
  font-size: 0.85em;
  cursor: pointer;
  transition: opacity 0.15s;
}
::v-deep .status-badge-interactive:hover {
  opacity: 0.8;
}
::v-deep button.capacity-value {
  background: transparent;
  border: none;
  border-bottom: 1px dashed currentColor;
  font: inherit;
  color: inherit;
  padding: 0;
  cursor: pointer;
}
::v-deep .capacity-value .fa-pencil {
  font-size: 0.85em;
}
</style>
