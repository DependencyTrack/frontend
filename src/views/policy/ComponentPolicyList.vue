<template>
  <div>
    <div id="componentPoliciesToolbar" class="bs-bars pull-left">
      <div class="form-inline" role="form">
        <b-button
          size="md"
          variant="outline-primary"
          :to="{ name: 'ComponentPolicyCreate' }"
        >
          <span class="fa fa-plus"></span> Create Policy
        </b-button>
      </div>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="policies"
      :options="tableOptions"
    />
  </div>
</template>

<script>
import common from '../../shared/common';
import xssFilters from 'xss-filters';
import permissionsMixin from '@/mixins/permissionsMixin';

const initialColumnVisible = (field, fallback) => {
  const stored = localStorage
    ? localStorage.getItem('ComponentPolicyListShow' + common.capitalize(field))
    : null;
  return stored !== null ? stored === 'true' : fallback;
};

export default {
  mixins: [permissionsMixin],
  data() {
    return {
      policies: [],
      tableOptions: {
        toolbar: '#componentPoliciesToolbar',
        search: true,
        searchTimeOut: 200,
        showColumns: true,
        showRefresh: true,
        pagination: true,
        sidePagination: 'client',
        pageSize: 10,
        pageList: '[10, 25, 50, 100]',
        icons: {
          refresh: 'fa-refresh',
          columns: 'fa-th-list',
        },
        onRefresh: () => {
          this.loadPolicies();
        },
        onColumnSwitch: (field, checked) => {
          if (localStorage) {
            localStorage.setItem(
              'ComponentPolicyListShow' + common.capitalize(field),
              checked.toString(),
            );
          }
        },
      },
      columns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: true,
          formatter: (value, row) => {
            const href = this.$router.resolve({
              name: 'ComponentPolicyEdit',
              params: { id: String(row.id) },
            }).href;
            return `<a href="${href}">${xssFilters.inHTMLData(common.valueWithDefault(value, ''))}</a>`;
          },
        },
        {
          title: this.$t('message.policy_operation_mode'),
          field: 'enabled',
          sortable: true,
          visible: initialColumnVisible('enabled', true),
          formatter: (value) =>
            value
              ? '<span class="badge badge-info">Apply</span>'
              : '<span class="badge badge-secondary">Disabled</span>',
        },
        {
          title: this.$t('message.policy_priority'),
          field: 'priority',
          sortable: true,
          visible: initialColumnVisible('priority', true),
        },
        {
          title: 'License override',
          field: 'license',
          sortable: true,
          visible: initialColumnVisible('license', true),
          formatter: (value) =>
            xssFilters.inHTMLData(common.valueWithDefault(value, '')),
        },
        {
          title: 'Details',
          field: 'details',
          visible: initialColumnVisible('details', false),
          formatter: (value) =>
            xssFilters.inHTMLData(common.valueWithDefault(value, '')),
        },
        {
          title: this.$t('message.validFrom'),
          field: 'validFrom',
          visible: initialColumnVisible('validFrom', false),
          formatter: (value) =>
            value ? common.formatTimestamp(Date.parse(value)) : '',
        },
        {
          title: this.$t('message.validUntil'),
          field: 'validUntil',
          visible: initialColumnVisible('validUntil', false),
          formatter: (value) =>
            value ? common.formatTimestamp(Date.parse(value)) : '',
        },
        {
          title: this.$t('message.author'),
          field: 'author',
          sortable: true,
          visible: initialColumnVisible('author', true),
          formatter: (value) =>
            xssFilters.inHTMLData(common.valueWithDefault(value, '')),
        },
      ],
    };
  },
  created() {
    this.loadPolicies();
  },
  methods: {
    loadPolicies() {
      const url = `${this.$api.BASE_URL}/api/v2/component-policies`;
      this.axios.get(url).then((response) => {
        this.policies = response.data.policies || [];
        this.$emit('total', this.policies.length);
        if (this.$refs.table) {
          this.$refs.table.load(this.policies, { silent: true });
        }
      });
    },
  },
};
</script>
