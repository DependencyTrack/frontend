<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="repositoryToolbar" class="bs-table-custom-toolbar">
        <b-button
          size="md"
          variant="outline-primary"
          v-b-modal.repositoryCreateRepositoryModal
        >
          <span class="fa fa-plus"></span> {{ $t('admin.create_repository') }}
        </b-button>
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options"
      >
      </bootstrap-table>
    </b-card-body>
    <repository-create-repository-modal
      :type="type"
      v-on:refreshTable="refreshTable"
    />
  </b-card>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import xssFilters from 'xss-filters';
import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput';
import i18n from '../../../i18n';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import common from '../../../shared/common';
import EventBus from '../../../shared/eventbus';
import RepositoryCreateRepositoryModal from './RepositoryCreateRepositoryModal';
import { parseRepositoryConfig } from '@/shared/utils';

export default {
  props: {
    header: String,
    type: String,
  },
  mixins: [bootstrapTableMixin],
  components: {
    RepositoryCreateRepositoryModal,
  },
  methods: {
    apiUrl: function () {
      return `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}/${this.type}?orderBy=resolutionOrder&sort=asc`;
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        pageNumber: 1,
        silent: true,
      });
    },
  },
  mounted() {
    EventBus.$on('admin:repository:rowUpdate', (index, row) => {
      this.$refs.table.updateRow({ index: index, row: row });
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
          field: 'identifier',
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.url'),
          field: 'url',
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.description'),
          field: 'description',
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.internal'),
          field: 'internal',
          class: 'tight',
          sortable: true,
          formatter(value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('admin.repository_authentication'),
          field: 'authenticationRequired',
          class: 'tight',
          sortable: true,
          formatter(value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('admin.enabled'),
          field: 'enabled',
          class: 'tight',
          sortable: true,
          formatter(value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('admin.repository_advisory_mirroring_enabled'),
          field: 'advisoryMirroringEnabled',
          class: 'tight',
          sortable: true,
          visible: this.type === 'COMPOSER',
          formatter(value, row, index) {
            return parseRepositoryConfig(row).advisoryMirroringEnabled === true
              ? '<i class="fa fa-check-square-o" />'
              : '';
          },
        },
        {
          title: this.$t('admin.repository_advisory_alias_sync_enabled'),
          field: 'advisoryAliasSyncEnabled',
          class: 'tight',
          sortable: true,
          visible: this.type === 'COMPOSER',
          formatter(value, row, index) {
            return parseRepositoryConfig(row).advisoryAliasSyncEnabled === true
              ? '<i class="fa fa-check-square-o" />'
              : '';
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
        sidePagination: 'client',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize: 10,
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
                <b-row class="expanded-row">
                  <b-col sm="6">
                    <b-validated-input-group-form-input
                      id="url" :label="$t('admin.url')"
                      input-group-size="mb-3" rules="required"
                      type="url" v-model="url"
                      autofocus="true"
                      v-debounce:750ms="updateRepository" :debounce-events="'keyup'"/>
                    <b-validated-input-group-form-input
                      id="description" :label="$t('admin.description')"
                      input-group-size="mb-3"
                      type="text" v-model="description"
                      autofocus="true"
                      v-debounce:750ms="updateRepository" :debounce-events="'keyup'"/>

                  </b-col>
                  <b-col sm="6">

                    <div>
                      <c-switch color="primary" v-model="enabled" label v-bind="labelIcon" />{{$t('admin.enabled')}}
                    </div>
                    <div>
                      <c-switch color="primary" v-model="internal" label v-bind="labelIcon" />{{$t('admin.internal')}}
                    </div>
                    <div v-if="this.type === 'COMPOSER'">
                      <c-switch color="primary" v-model="advisoryMirroringEnabled" label v-bind="labelIcon" />{{$t('admin.repository_advisory_mirroring_toggle')}}
                    </div>
                    <div v-show="advisoryMirroringEnabled" v-if="this.type === 'COMPOSER'">
                      <c-switch color="primary" v-model="advisoryAliasSyncEnabled" label v-bind="labelIcon" />{{$t('admin.repository_advisory_alias_sync_toggle')}}
                    </div>

                    <div>
                      <c-switch color="primary" v-model="authenticationRequired" label v-bind="labelIcon" />{{$t('admin.repository_authentication')}}
                    </div>
                    <div>
                      <b-validated-input-group-form-input
                        id="username" :label="$t('admin.username')"
                        input-group-size="mb-3"
                        v-model="username"
                        rules="required"
                        v-show="authenticationRequired"
                        v-debounce:750ms="updateRepository" :debounce-events="'keyup'"/>
                    </div>

                    <div>
                      <b-validated-input-group-form-input
                        id="password" :label="$t('admin.password')"
                        input-group-size="mb-3"
                        type="password"
                        v-model="password"
                        rules="required"
                        v-show="authenticationRequired"
                        v-debounce:750ms="updateRepository" :debounce-events="'keyup'"/>
                    </div>

                    <div style="text-align:right">
                       <b-button variant="outline-danger" @click="deleteRepository">{{ $t('admin.delete_repository') }}</b-button>
                    </div>
                  </b-col>
                </b-row>
              `,
            components: {
              cSwitch,
              BValidatedInputGroupFormInput,
            },
            data() {
              return {
                repository: row,
                type: row.type,
                identifier: row.identifier,
                description: row.description,
                url: row.url,
                internal: row.internal,
                authenticationRequired: row.authenticationRequired,
                username: row.username,
                password: row.password || 'HiddenDecryptedPropertyPlaceholder',
                enabled: row.enabled,
                advisoryMirroringEnabled:
                  parseRepositoryConfig(row).advisoryMirroringEnabled,
                advisoryAliasSyncEnabled:
                  parseRepositoryConfig(row).advisoryAliasSyncEnabled,
                uuid: row.uuid,
                labelIcon: {
                  dataOn: '\u2713',
                  dataOff: '\u2715',
                },
              };
            },
            watch: {
              internal() {
                this.updateRepository();
              },
              enabled() {
                this.updateRepository();
              },
              authenticationRequired() {
                this.updateRepository();
              },
              advisoryMirroringEnabled() {
                this.updateRepository();
              },
              advisoryAliasSyncEnabled() {
                this.updateRepository();
              },
            },
            methods: {
              deleteRepository: function () {
                let url = `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}/${this.uuid}`;
                this.axios
                  .delete(url)
                  .then((response) => {
                    EventBus.$emit('admin:repository:rowDeleted', index);
                    this.$toastr.s(this.$t('admin.repository_deleted'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              updateRepository: function () {
                let url = `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}`;
                this.axios
                  .post(url, {
                    identifier: this.identifier,
                    description: this.description,
                    url: this.url,
                    internal: this.internal,
                    authenticationRequired: this.authenticationRequired,
                    config: JSON.stringify({
                      advisoryMirroringEnabled: this.advisoryMirroringEnabled,
                      advisoryAliasSyncEnabled: this.advisoryAliasSyncEnabled,
                    }),
                    username: this.username,
                    password:
                      this.password || 'HiddenDecryptedPropertyPlaceholder',
                    enabled: this.enabled,
                    uuid: this.uuid,
                  })
                  .then((response) => {
                    this.repository = response.data;
                    EventBus.$emit(
                      'admin:repository:rowUpdate',
                      index,
                      this.repository,
                    );
                    this.$toastr.s(this.$t('message.updated'));
                  })
                  .catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
            },
          });
        },
        onExpandRow: this.vueFormatterInit,
        toolbar: '#repositoryToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
        url: this.apiUrl(),
      },
    };
  },
};
</script>
