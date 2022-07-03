<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button size="md" variant="outline-primary" v-b-modal.createTemplateModal>
          <span class="fa fa-plus"></span> {{ $t('admin.create_template') }}
        </b-button>
        <b-button size="md" variant="outline-primary" v-b-modal.generalTemplateConfigurationModal>
          <span class="fa fa-wrench"></span> {{ $t('admin.general_template_configuration') }}
        </b-button>
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options">
      </bootstrap-table>
    </b-card-body>
    <create-template-modal v-on:refreshTable="refreshTable" />
    <general-template-configuration-modal v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
  import xssFilters from "xss-filters";
  import common from "../../../shared/common";
  import i18n from "../../../i18n";
  import EventBus from "../../../shared/eventbus";
  import BootstrapToggle from "vue-bootstrap-toggle";
  import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
  import BInputGroupFormInput from "../../../forms/BInputGroupFormInput";
  import CreateTemplateModal from "./CreateTemplateModal";
  import GeneralTemplateConfigurationModal from "./GeneralTemplateConfigurationModal";
  

  export default {
    props: {
      header: String
    },
    mixins: [bootstrapTableMixin],
    components: {
      CreateTemplateModal,
      GeneralTemplateConfigurationModal
    },
    mounted() {
      EventBus.$on('admin:templates:rowUpdate', (index, row) => {
        this.$refs.table.updateRow( {index: index, row: row});
        this.$refs.table.expandRow(index);
      });
      EventBus.$on('admin:templates:rowDeleted', () => {
        this.refreshTable();
      });
    },
    beforeDestroy() {
      EventBus.$off('admin:templates:rowUpdate');
      EventBus.$off('admin:templates:rowDeleted');
    },
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
                    <b-form-group v-if="template.defaultPublisher" id="fieldset-1" :label="this.$t('message.name')" label-for="input-1">
                      <b-form-input id="input-1" v-model="template.name" disabled class="form-control disabled" trim />
                    </b-form-group>
                    <b-input-group-form-input v-if="!template.defaultPublisher" id="input-1" :label="$t('message.name')" input-group-size="mb-3"
                                              required="true" type="text" v-model="template.name" />
                    <b-form-group v-if="template.defaultPublisher" id="fieldset-2" :label="this.$t('admin.publisher_class')" label-for="input-2">
                      <b-form-input v-if="template.defaultPublisher" id="input-2" v-model="template.publisherClass" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-input-group-form-input v-if="!template.defaultPublisher" id="input-2" :label="this.$t('admin.publisher_class')" input-group-size="mb-3"
                                              required="true" type="text" v-model="template.publisherClass" />
                    <b-form-group v-if="template.defaultPublisher" id="fieldset-3" :label="this.$t('message.description')" label-for="input-3">
                      <b-form-textarea v-if="template.defaultPublisher" id="input-3" v-model="template.description" rows="4" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-input-group-form-input v-if="!template.defaultPublisher" id="input-3" :label="this.$t('message.description')" input-group-size="mb-3"
                                              required="true" type="text" v-model="template.description" />
                  </b-col>
                  <b-col sm="6">
                    <b-form-group v-if="template.defaultPublisher" id="fieldset-4" :label="this.$t('admin.mime_type')" label-for="input-4">
                      <b-form-input v-if="template.defaultPublisher" id="input-4" v-model="template.templateMimeType" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-input-group-form-input v-if="!template.defaultPublisher" id="input-4" :label="this.$t('admin.mime_type')" input-group-size="mb-3"
                                              required="true" type="text" v-model="template.templateMimeType" />
                    <b-form-group id="fieldset-5" :label="this.$t('admin.template')" label-for="imput-5">
                      <b-form-textarea v-if="template.defaultPublisher" id="input-5" v-model="template.template" rows="10" disabled class="form-control disabled" readonly trim />
                      <b-form-textarea v-else id="input-5" v-model="template.template" rows="10" class="form-control" required trim />
                    </b-form-group>
                    <div style="text-align:right">
                      <b-button v-if="!template.defaultPublisher" variant="outline-primary" @click="updateNotificationPublisher">{{ $t('message.update') }}</b-button>
                      <b-button v-if="!template.defaultPublisher" variant="outline-danger" @click="deleteNotificationPublisher">{{ $t('admin.delete_template') }}</b-button>
                    </div>    
                  </b-col>
                </b-row>
              `,
              data() {
                return {
                  template: row
                }
              },
              components: {
                BootstrapToggle,
                BInputGroupFormInput
              },
              methods: {
                updateNotificationPublisher: function() {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_PUBLISHER}`;
                  this.axios.post(url, {
                    uuid: this.template.uuid,
                    name: this.template.name,
                    description: this.template.description,
                    publisherClass: this.template.publisherClass,
                    template: this.template.template,
                    templateMimeType: this.template.templateMimeType
                  }).then((response) => {
                    this.template = response.data;
                    EventBus.$emit('admin:templates:rowUpdate', index, this.template);
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch(() => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                deleteNotificationPublisher: function() {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_PUBLISHER}/${this.template.uuid}`;
                  this.axios.delete(url).then((response) => {
                    this.template = response.data;
                    EventBus.$emit('admin:templates:rowDeleted', index);
                    this.$toastr.s(this.$t('admin.template_deleted'));
                  }).catch(() => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
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
          url: `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_PUBLISHER}`
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

<style>

#customToolbar > :not(:last-child) {
  margin-right: .25rem;
}

#customToolbar > :not(:first-child) {
  margin-left: .25rem;
}

</style>
