<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button size="md" variant="outline-primary" v-b-modal.createAlertModal>
          <span class="fa fa-plus"></span> {{ $t('admin.create_alert') }}
        </b-button>
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options">
      </bootstrap-table>
    </b-card-body>
    <create-alert-modal v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
  import xssFilters from "xss-filters";
  import common from "../../../shared/common";
  import i18n from "../../../i18n";
  import CreateAlertModal from "./CreateAlertModal";
  import BootstrapToggle from "vue-bootstrap-toggle";
  import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";

  export default {
    props: {
      header: String
    },
    mixins: [bootstrapTableMixin],
    components: {
      CreateAlertModal
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.publisher'),
            field: "publisher.name",
            sortable: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.scope'),
            field: "scope",
            sortable: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.notification_level'),
            field: "notificationLevel",
            sortable: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
        ],
        data: [],
        options: {
          search: true,
          showColumns: true,
          showRefresh: true,
          pagination: true,
          silentSort: false,
          sidePagination: 'client',
          queryParamsType: 'pageSize',
          pageList: '[10, 25, 50, 100]',
          pageSize: 10,
          icons: {
            refresh: 'fa-refresh'
          },
          detailView: true,
          detailViewIcon: false,
          detailViewByClick: true,
          detailFormatter: (index, row) => {
            console.log(row);
            return this.vueFormatter({
              i18n,
              template: `
                <b-row class="expanded-row">
                  <b-col sm="6">
                    <b-form-group id="fieldset-1" :label="this.$t('message.name')" label-for="input-1">
                      <b-form-input id="input-1" v-model="alert.name" required class="form-control required" trim />
                    </b-form-group>
                    <b-form-group id="fieldset-2" :label="this.$t('admin.publisher_class')" label-for="input-2">
                      <b-form-input id="input-2" v-model="alert.publisher.publisherClass" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group id="fieldset-3" :label="this.$t('admin.notification_level')" label-for="input-3">
                      <b-form-input id="input-3" v-model="alert.notificationLevel" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group id="fieldset-4" :label="this.$t('admin.destination')" label-for="input-4">
                      <b-form-input id="input-4" v-model="alert.destination" required class="form-control required" trim />
                    </b-form-group>
                  </b-col>
                  <b-col sm="6">
                    <b-form-group id="fieldset-5" :label="this.$t('admin.scope')" label-for="input-5">
                      <b-form-input id="input-5" v-model="alert.scope" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group id="fieldset-6" :label="this.$t('admin.scope')" label-for="input-6">
                      <b-list-group>
                        <b-list-group-item v-for="option in notifyOnOptions" v-bind:key="option">
                          <b-form-checkbox :name="option">{{ option }}</b-form-checkbox>
                        </b-list-group-item>
                      </b-list-group>
                    </b-form-group>
                  </b-col>
                </b-row>
              `,
              data() {
                return {
                  alert: row
                }
              },
              computed: {
                notifyOnOptions () {
                  if (this.alert.scope === "PORTFOLIO") {
                    return [
                      'NEW_VULNERABILITY',
                      'NEW_VULNERABLE_DEPENDENCY',
                      'GLOBAL_AUDIT_CHANGE',
                      'PROJECT_AUDIT_CHANGE',
                      'BOM_CONSUMED',
                      'BOM_PROCESSED'
                    ]
                  } else if (this.alert.scope === "SYSTEM") {
                    return [
                      'DATASOURCE_MIRRORING',
                      'FILE_SYSTEM',
                      'INDEXING_SERVICE',
                      'REPOSITORY'
                    ]
                  }
                }
              }
            })
          },
          onExpandRow: this.vueFormatterInit,
          toolbar: '#customToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_RULE}`
        }
      };
    },
    methods: {
      refreshTable: function() {
        this.$refs.table.refresh({
          silent: true
        });
      }
    }
  }
</script>
