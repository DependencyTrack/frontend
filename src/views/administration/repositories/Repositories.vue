<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="repositoryToolbar" class="bs-table-custom-toolbar">
        <b-button size="md" variant="outline-primary" v-b-modal.repositoryCreateRepositoryModal>
          <span class="fa fa-plus"></span> {{ $t('admin.create_repository') }}
        </b-button>
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options">
      </bootstrap-table>
    </b-card-body>
    <repository-create-repository-modal :type="type" v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
  import { CSwitch } from "@coreui/vue";
  import xssFilters from "xss-filters";
  import BValidatedInputGroupFormInput from "../../../forms/BValidatedInputGroupFormInput";
  import i18n from "../../../i18n";
  import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
  import common from "../../../shared/common";
  import EventBus from "../../../shared/eventbus";
  import RepositoryCreateRepositoryModal from "./RepositoryCreateRepositoryModal";

  export default {
    props: {
      header: String,
      type: String
    },
    mixins: [bootstrapTableMixin],
    components: {
      RepositoryCreateRepositoryModal
    },
    methods: {
      apiUrl: function () {
        return `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}/${this.type}?orderBy=resolutionOrder&sort=asc`;
      },
      refreshTable: function() {
        this.$refs.table.refresh({
          url: this.apiUrl(),
          pageNumber: 1,
          silent: true
        });
      }
    },
    mounted() {
      EventBus.$on('admin:repository:rowUpdate', (index, row) => {
        this.$refs.table.updateRow( {index: index, row: row});
        this.$refs.table.expandRow(index);
      });
      EventBus.$on('admin:repository:rowDeleted', (index, row) => {
        this.refreshTable();
      });
    },
    beforeDestroy() {
      EventBus.$off('admin:repository:rowUpdate');
      EventBus.$off('admin:repository:rowDeleted');
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('admin.identifier'),
            field: "identifier",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.url'),
            field: "url",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.internal'),
            field: "internal",
            class: "tight",
            sortable: true,
            formatter(value, row, index) {
              return value === true ? '<i class="fa fa-check-square-o" />' : "";
            },
          },
          {
            title: this.$t('admin.enabled'),
            field: "enabled",
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
                    <b-validated-input-group-form-input
                      id="url" :label="$t('admin.url')"
                      input-group-size="mb-3" rules="required"
                      type="url" v-model="url"
                      autofocus="true"
                      v-debounce:750ms="updateRepository" :debounce-events="'keyup'"/>
                  </b-col>
                  <b-col sm="6">

                    <div>
                      <CSwitch color="primary" :checked.sync="internal" label />{{$t('admin.internal')}}
                    </div>

                    <div>
                      <b-validated-input-group-form-input
                        id="username" :label="$t('admin.username')"
                        input-group-size="mb-3"
                        v-model="username"
                        v-show="internal"
                        v-debounce:750ms="updateRepository" :debounce-events="'keyup'"/>
                    </div>

                    <div>
                      <b-validated-input-group-form-input
                        id="password" :label="$t('admin.password')"
                        input-group-size="mb-3"
                        v-model="password"
                        v-show="internal"
                        v-debounce:750ms="updateRepository" :debounce-events="'keyup'"/>
                    </div>

                    <div>
                      <CSwitch color="primary" :checked.sync="enabled" label />{{$t('admin.enabled')}}
                    </div>

                    <div style="text-align:right">
                        <b-button variant="outline-danger" @click="deleteRepository">{{ $t('admin.delete_repository') }}</b-button>
                    </div>
                  </b-col>
                </b-row>
              `,
              components: {
                CSwitch,
                BValidatedInputGroupFormInput
              },
              data() {
                return {
                  repository: row,
                  identifier: row.identifier,
                  url: row.url,
                  internal: row.internal,
                  username: row.username,
                  password: row.password || null,
                  enabled: row.enabled,
                  uuid: row.uuid,
                }
              },
              watch: {
                internal() {
                  this.updateRepository();
                },
                enabled() {
                  this.updateRepository();
                }
              },
              methods: {
                deleteRepository: function() {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}/${this.uuid}`;
                  this.axios.delete(url).then((response) => {
                    EventBus.$emit('admin:repository:rowDeleted', index);
                    this.$toastr.s(this.$t('admin.repository_deleted'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                updateRepository: function() {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}`;
                  this.axios.post(url, {
                    identifier: this.identifier,
                    url: this.url,
                    internal: this.internal,
                    username: this.username,
                    password: this.password || null,
                    enabled: this.enabled,
                    uuid: this.uuid
                  }).then((response) => {
                    this.repository = response.data;
                    EventBus.$emit('admin:repository:rowUpdate', index, this.repository);
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                }
              }
            })
          },
          onExpandRow: this.vueFormatterInit,
          toolbar: '#repositoryToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: this.apiUrl()
        }
      };
    }
  }
</script>
