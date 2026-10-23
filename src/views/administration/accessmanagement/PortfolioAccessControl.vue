<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-form-checkbox id="isAclEnabled" v-model="isAclEnabled" switch>{{
          $t('admin.enable_acl')
        }}</b-form-checkbox>
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options"
      >
      </bootstrap-table>
    </b-card-body>
  </b-card>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '../../../shared/common';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import configPropertyMixin from '../mixins/configPropertyMixin';
import PortfolioAccessControlDetails from './PortfolioAccessControlDetails.vue';

export default {
  props: {
    header: String,
  },
  mixins: [bootstrapTableMixin, configPropertyMixin],
  data() {
    return {
      isAclEnabled: false,
      columns: [
        {
          title: this.$t('admin.team_name'),
          field: 'name',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
      ],
      data: [],
      options: {
        search: true,
        showColumns: true,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        sidePagination: 'server',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize: 10,
        icons: {
          refresh: 'fa-refresh',
        },
        detailView: true,
        detailViewIcon: false,
        detailViewByClick: true,
        detailFormatter: (_index, row) => {
          return this.cell(PortfolioAccessControlDetails, { row });
        },
        onExpandRow: this.mountCells,
        toolbar: '#customToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_TEAM}`,
      },
    };
  },
  methods: {
    refreshTable: function () {
      this.$refs.table.refresh({
        silent: true,
      });
    },
    updateProperties: function () {
      this.updateConfigProperties([
        {
          groupName: 'access-management',
          propertyName: 'acl.enabled',
          propertyValue: this.isAclEnabled,
        },
      ]);
    },
    updateConfigProperties: function (configProperties) {
      let props = [];
      for (let i = 0; i < configProperties.length; i++) {
        let prop = configProperties[i];
        prop.propertyValue = common.trimToNull(prop.propertyValue);
        props.push(prop);
      }
      let url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/aggregate`;
      this.axios
        .post(url, props)
        .then(() => {
          this.$toastr.s(this.$t('admin.configuration_saved'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
  },
  watch: {
    isAclEnabled() {
      this.updateProperties();
    },
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'access-management';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case 'acl.enabled':
            this.isAclEnabled = common.toBoolean(item.propertyValue);
            break;
        }
      }
    });
  },
};
</script>
