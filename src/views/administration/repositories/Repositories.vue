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
import SecretRefSelect from '../../components/SecretRefSelect.vue';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import common from '../../../shared/common';
import EventBus from '../../../shared/eventbus';
import RepositoryCreateRepositoryModal from './RepositoryCreateRepositoryModal';

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
    EventBus.$on('admin:repository:rowDeleted', () => {
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
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.url'),
          field: 'url',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('admin.internal'),
          field: 'internal',
          class: 'tight',
          sortable: true,
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('admin.repository_authentication'),
          field: 'authenticationRequired',
          class: 'tight',
          sortable: true,
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('admin.enabled'),
          field: 'enabled',
          class: 'tight',
          sortable: true,
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
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
                  <b-col sm="12">
                    <b-form @submit.prevent="updateRepository" style="max-width: 40rem">
                      <b-validated-input-group-form-input
                        id="url" :label="$t('admin.url')"
                        input-group-size="mb-3" rules="required"
                        type="url" v-model="url"
                        autofocus="true"/>
                      <div class="mb-3">
                        <c-switch color="primary" v-model="enabled" label v-bind="labelIcon" />{{$t('admin.enabled')}}
                      </div>
                      <div class="mb-3">
                        <c-switch color="primary" v-model="internal" label v-bind="labelIcon" />{{$t('admin.internal')}}
                      </div>
                      <div class="mb-3">
                        <c-switch color="primary" v-model="authenticationRequired" label v-bind="labelIcon" />{{$t('admin.repository_authentication')}}
                      </div>
                      <div v-if="authenticationRequired" class="ml-4">
                        <b-validated-input-group-form-input
                          id="username" :label="$t('admin.username')"
                          input-group-size="mb-3"
                          v-model="username"
                          />
                        <div class="mb-3">
                          <label for="password">{{$t('admin.password')}} <i
                            class="fa fa-key text-warning ml-1"
                            :title="$t('admin.secret_reference_field')"
                          ></i></label>
                          <secret-ref-select id="password" v-model="password" />
                        </div>
                      </div>
                      <div class="d-flex justify-content-end mt-3">
                        <b-button type="submit" variant="primary" class="mr-2">{{ $t('message.update') }}</b-button>
                        <b-button variant="outline-danger" @click="deleteRepository">{{ $t('message.delete') }}</b-button>
                      </div>
                    </b-form>
                  </b-col>
                </b-row>
              `,
            components: {
              cSwitch,
              BValidatedInputGroupFormInput,
              SecretRefSelect,
            },
            data() {
              return {
                repository: row,
                identifier: row.identifier,
                url: row.url,
                internal: row.internal,
                authenticationRequired: row.authenticationRequired,
                username: row.username,
                password: row.password,
                enabled: row.enabled,
                uuid: row.uuid,
                labelIcon: {
                  dataOn: '\u2713',
                  dataOff: '\u2715',
                },
              };
            },
            methods: {
              deleteRepository: function () {
                let url = `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}/${this.uuid}`;
                this.axios
                  .delete(url)
                  .then(() => {
                    EventBus.$emit('admin:repository:rowDeleted', index);
                    this.$toastr.s(this.$t('admin.repository_deleted'));
                  })
                  .catch(() => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
              },
              updateRepository: function () {
                let url = `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}`;
                this.axios
                  .post(url, {
                    identifier: this.identifier,
                    url: this.url,
                    internal: this.internal,
                    authenticationRequired: this.authenticationRequired,
                    username: this.username,
                    password: this.password,
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
                  .catch(() => {
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
