<template>
  <b-card no-body :header="header">
    <b-card-body>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options">
      </bootstrap-table>
    </b-card-body>
  </b-card>
</template>

<script>
  import xssFilters from "xss-filters";
  import common from "../../../shared/common";
  import i18n from "../../../i18n";
  import BootstrapToggle from "vue-bootstrap-toggle";
  import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";

  export default {
    props: {
      header: String
    },
    mixins: [bootstrapTableMixin],
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.default'),
            field: "defaultPublisher",
            class: "tight",
            sortable: true,
            formatter(value, row, index) {
              return value === true ? '<i class="fa fa-check-square-o" />' : "";
            },
          }
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
            return this.vueFormatter({
              i18n,
              template: `
                <b-row class="expanded-row">
                  <b-col sm="6">
                    <b-form-group id="fieldset-1" :label="this.$t('message.name')" label-for="input-1">
                      <b-form-input id="input-1" v-model="template.name" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group id="fieldset-2" :label="this.$t('admin.publisher_class')" label-for="input-2">
                      <b-form-input id="input-2" v-model="template.publisherClass" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group id="fieldset-3" :label="this.$t('message.description')" label-for="input-3">
                      <b-form-textarea id="input-3" v-model="template.description" rows="4" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                  </b-col>
                  <b-col sm="6">
                    <b-form-group id="fieldset-4" :label="this.$t('admin.mime_type')" label-for="input-4">
                      <b-form-input id="input-4" v-model="template.templateMimeType" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group id="fieldset-5" :label="this.$t('admin.template')" label-for="imput-5">
                      <b-form-textarea id="input-5" v-model="template.template" rows="10" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                  </b-col>
                </b-row>
              `,
              data() {
                return {
                  template: row
                }
              },
              components: {
                BootstrapToggle
              }
            })
          },
          onExpandRow: this.vueFormatterInit,
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_PUBLISHER}`
        }
      };
    }
  }
</script>
