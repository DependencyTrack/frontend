<template>
  <div class="animated fadeIn" v-permission="'POLICY_MANAGEMENT'">
    <div id="licenseGroupsToolbar" class="bs-table-custom-toolbar">
      <b-button
        size="md"
        variant="outline-primary"
        v-b-modal.createLicenseGroupModal
        v-permission="PERMISSIONS.POLICY_MANAGEMENT"
      >
        <span class="fa fa-plus"></span>
        {{ $t('message.create_license_group') }}
      </b-button>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="tableLoaded"
    />
    <create-license-group-modal v-on:refreshTable="refreshTable" />
  </div>
</template>

<script>
import common from '../../shared/common';
import xssFilters from 'xss-filters';
import CreateLicenseGroupModal from './CreateLicenseGroupModal';
import permissionsMixin from '../../mixins/permissionsMixin';
import i18n from '../../i18n';
import ActionableListGroupItem from '../components/ActionableListGroupItem';
import EventBus from '../../shared/eventbus';
import bootstrapTableMixin from '../../mixins/bootstrapTableMixin';
import SelectLicenseModal from './SelectLicenseModal';
import BInputGroupFormInput from '../../forms/BInputGroupFormInput';

export default {
  mixins: [permissionsMixin, bootstrapTableMixin],
  components: {
    CreateLicenseGroupModal,
  },
  mounted() {
    EventBus.$on('policyManagement:licenseGroups:rowUpdate', (index, row) => {
      this.$refs.table.updateRow({ index: index, row: row });
      this.$refs.table.expandRow(index);
    });
    EventBus.$on('policyManagement:licenseGroups:rowDeleted', (index, row) => {
      this.refreshTable();
    });
  },
  beforeDestroy() {
    EventBus.$off('policyManagement:licenseGroups:rowUpdate');
    EventBus.$off('policyManagement:licenseGroups:rowDeleted');
  },
  methods: {
    tableLoaded: function (data) {
      if (data && Object.prototype.hasOwnProperty.call(data, 'total')) {
        this.$emit('total', data.total);
      } else {
        this.$emit('total', '?');
      }
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        silent: true,
      });
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
      ],
      data: [],
      options: {
        showHeader: false,
        search: true,
        showColumns: false,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        sidePagination: 'server',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize:
          localStorage &&
          localStorage.getItem('LicenseGroupListPageSize') !== null
            ? Number(localStorage.getItem('LicenseGroupListPageSize'))
            : 10,
        icons: {
          refresh: 'fa-refresh',
        },
        detailView: true,
        detailViewIcon: false,
        detailViewByClick: true,
        detailFormatter: (index, row) => {
          return this.vueFormatter({
            i18n,
            template: `
                <div>
                  <b-row class="expanded-row">
                    <b-col sm="6">
                      <b-input-group-form-input id="input-license-group-name" :label="$t('message.name')" input-group-size="mb-3"
                                                required="true" type="text" v-model="name" lazy="true" autofocus="true"
                                                v-debounce:750ms="updateLicenseGroup" :debounce-events="'keyup'" />
                    </b-col>
                    <b-col sm="6">
                    </b-col>
                  </b-row>
                  <b-row class="expanded-row">
                    <b-col sm="12">
                      <b-form-group>
                        <div>
                          <div class="font-weight-bold mb-2">
                            <b-row>
                              <b-col md="8">{{$t('message.name')}}</b-col>
                              <b-col md="3">{{$t('message.spdx_license_id')}}</b-col>
                              <b-col md="1"></b-col>
                            </b-row>
                          </div>
                          <div v-for="license in licenses" :key="license.uuid" class="mb-2">
                            <b-row class="align-items-center">
                              <b-col md="8" class="d-flex align-items-center">{{ license.name }}</b-col>
                              <b-col md="3" class="d-flex align-items-center text-muted">
                                <a
                                  v-if="license.licenseId"
                                  :href="'/portfolio/licenses/' + encodeURIComponent(license.licenseId)"
                                >
                                  {{ license.licenseId }}
                                </a>
                                <span v-else>-</span>
                              </b-col>
                              <b-col md="1" class="d-flex align-items-center justify-content-end">
                                <b-button size="sm" variant="outline-danger" @click="removeLicense(license)">
                                  <span class="fa fa-trash"></span>
                                </b-button>
                              </b-col>
                            </b-row>
                          </div>
                          <div>
                            <actionable-list-group-item :add-icon="true" v-on:actionClicked="$root.$emit('bv::show::modal', 'selectLicenseModal')" />
                          </div>
                        </div>
                      </b-form-group>
                      <div style="text-align:right">
                        <b-button variant="outline-danger" @click="deleteLicenseGroup">{{ $t('message.delete_license_group') }}</b-button>
                      </div>
                    </b-col>
                  </b-row>
                  <select-license-modal v-on:selection="updateLicenseSelection" />
                </div>
              `,
            mixins: [permissionsMixin],
            components: {
              ActionableListGroupItem,
              BInputGroupFormInput,
              SelectLicenseModal,
            },
            data() {
              return {
                licenseGroup: row,
                name: row.name,
                licenses: row.licenses,
              };
            },
            methods: {
              updateLicenseGroup: function () {
                let url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}`;
                this.axios
                  .post(url, {
                    uuid: this.licenseGroup.uuid,
                    name: this.name,
                  })
                  .then((response) => {
                    this.licenseGroup = response.data;
                    EventBus.$emit(
                      'policyManagement:licenseGroups:rowUpdate',
                      index,
                      this.licenseGroup,
                    );
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              deleteLicenseGroup: function () {
                let url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}/${this.licenseGroup.uuid}`;
                this.axios
                  .delete(url)
                  .then((response) => {
                    EventBus.$emit(
                      'policyManagement:licenseGroups:rowDeleted',
                      index,
                    );
                    this.$toastr.s(this.$t('message.license_group_deleted'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              removeLicense: function (license) {
                let url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}/${this.licenseGroup.uuid}/license/${license.uuid}`;
                this.axios
                  .delete(url)
                  .then((response) => {
                    this.syncVariables(response.data);
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              updateLicenseSelection: function (selections) {
                this.$root.$emit('bv::hide::modal', 'selectLicenseModal');
                for (let i = 0; i < selections.length; i++) {
                  let selection = selections[i];
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}/${this.licenseGroup.uuid}/license/${selection.uuid}`;
                  this.axios
                    .post(url)
                    .then((response) => {
                      this.syncVariables(response.data);
                      this.$toastr.s(this.$t('message.updated'));
                    })
                    .catch((error) => {
                      if (error.response.status === 304) {
                        //this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      } else {
                        this.$toastr.w(
                          this.$t('condition.unsuccessful_action'),
                        );
                      }
                    });
                }
              },
              syncVariables: function (licenseGroup) {
                this.licenseGroup = licenseGroup;
                this.name = licenseGroup.name;
                this.licenses = licenseGroup.licenses;
              },
            },
          });
        },
        onExpandRow: this.vueFormatterInit,
        toolbar: '#licenseGroupsToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}`,
        onPageChange: (number, size) => {
          if (localStorage) {
            localStorage.setItem('LicenseGroupListPageSize', size.toString());
          }
        },
      },
    };
  },
};
</script>
