<template>
  <b-modal
    id="serviceDetailsModal"
    size="lg"
    hide-header-close
    no-stacking
    :title="$t('message.service_details')"
  >
    <b-tabs class="body-bg-color" style="border: 0; padding: 0">
      <b-tab class="body-bg-color" style="border: 0; padding: 0" active>
        <template v-slot:title
          ><i class="fa fa-cube"></i> {{ $t('message.identity') }}</template
        >
        <b-card>
          <b-input-group-form-input
            id="service-name-input"
            input-group-size="mb-3"
            type="text"
            v-model="service.name"
            lazy="true"
            required="true"
            feedback="true"
            autofocus="false"
            :label="$t('message.service_name')"
            :tooltip="this.$t('message.service_name_desc')"
            :feedback-text="$t('message.required_service_name')"
            :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
          />
          <b-input-group-form-input
            id="service-version-input"
            input-group-size="mb-3"
            type="text"
            v-model="service.version"
            required="false"
            :label="$t('message.version')"
            :tooltip="this.$t('message.service_version_desc')"
            :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
          />
          <b-input-group-form-input
            id="service-group-input"
            input-group-size="mb-3"
            type="text"
            v-model="service.group"
            required="false"
            :label="$t('message.component_namespace_group_vendor')"
            :tooltip="this.$t('message.component_group_desc')"
            :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
          />
          <b-form-group
            id="service-notes-form-group"
            :label="this.$t('message.description')"
            label-for="service-notes-input"
          >
            <b-form-textarea
              id="service-notes-description"
              v-model="service.description"
              rows="3"
              :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
            />
          </b-form-group>
          <b-input-group-form-input
            id="service-uuid"
            input-group-size="mb-3"
            type="text"
            v-model="service.uuid"
            lazy="false"
            required="false"
            feedback="false"
            autofocus="false"
            disabled="true"
            :label="$t('message.object_identifier')"
            :tooltip="this.$t('message.object_identifier_desc')"
            :readonly="true"
          />
        </b-card>
      </b-tab>
      <b-tab>
        <template v-slot:title
          ><i class="fa fa-building-o"></i>
          {{ $t('message.provider') }}</template
        >
        <b-card>
          <b-input-group-form-input
            id="service-provider-name-input"
            input-group-size="mb-3"
            type="text"
            v-model="service.provider.name"
            required="false"
            :label="$t('message.provider_name')"
            :tooltip="this.$t('message.service_provider_name_desc')"
          />
          <b-form-group
            id="providerUrlsTable-Fieldset"
            :label="this.$t('message.urls')"
            label-for="providerUrlsTable"
          >
            <bootstrap-table
              id="providerUrlsTable"
              ref="providerUrlsTable"
              :columns="providerUrlsTableColumns"
              :data="service.provider.urls"
              :options="providerUrlsTableOptions"
            >
            </bootstrap-table>
          </b-form-group>
          <b-form-group
            id="contactsTable-Fieldset"
            :label="this.$t('message.contacts')"
            label-for="contactsTable"
          >
            <bootstrap-table
              id="contactsTable"
              ref="contactsTable"
              :columns="contactsTableColumns"
              :data="service.provider.contacts"
              :options="contactsTableOptions"
            >
            </bootstrap-table>
          </b-form-group>
        </b-card>
      </b-tab>
      <b-tab>
        <template v-slot:title
          ><i class="fa fa-globe"></i> {{ $t('message.endpoints') }}</template
        >
        <b-card>
          <bootstrap-table
            ref="endpointTable"
            :columns="endpointTableColumns"
            :data="service.endpoints"
            :options="endpointTableOptions"
          >
          </bootstrap-table>
        </b-card>
      </b-tab>
      <b-tab>
        <template v-slot:title
          ><i class="fa fa-server"></i> {{ $t('message.data') }}</template
        >
        <b-card>
          <bootstrap-table
            ref="dataTable"
            :columns="dataTableColumns"
            :data="service.data"
            :options="dataTableOptions"
          >
          </bootstrap-table>
        </b-card>
      </b-tab>
      <b-tab>
        <template v-slot:title
          ><i class="fa fa-external-link"></i>
          {{ $t('message.external_references') }}</template
        >
        <b-card>
          <bootstrap-table
            ref="referencesTable"
            :columns="referencesTableColumns"
            :data="service.externalReferences"
            :options="referencesTableOptions"
          >
          </bootstrap-table>
        </b-card>
      </b-tab>
    </b-tabs>
    <template v-slot:modal-footer="{ cancel }">
      <b-button
        size="md"
        variant="outline-danger"
        @click="deleteService()"
        v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT"
        >{{ $t('message.delete') }}</b-button
      >
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button
        size="md"
        variant="primary"
        @click="updateService()"
        v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT"
        >{{ $t('message.update') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import BInputGroupFormInput from '../../../forms/BInputGroupFormInput';
import BInputGroupFormSelect from '../../../forms/BInputGroupFormSelect';
import permissionsMixin from '../../../mixins/permissionsMixin';
import xssFilters from 'xss-filters';
import common from '@/shared/common';

export default {
  name: 'ServiceDetailsModal',
  mixins: [permissionsMixin],
  components: {
    BInputGroupFormInput,
    BInputGroupFormSelect,
  },
  props: {
    service: Object,
  },
  data() {
    return {
      contactsTableColumns: [
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.email'),
          field: 'email',
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.phone'),
          field: 'phone',
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
      ],
      contactsTableOptions: {
        search: false,
        showColumns: false,
        showRefresh: false,
        pagination: true,
        silentSort: false,
        sidePagination: 'client',
        queryParamsType: 'pageSize',
        pageList: '[5, 10, 25]',
        pageSize: 5,
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
      },
      providerUrlsTableColumns: [
        {
          title: this.$t('message.urls'),
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(row, ''));
          },
        },
      ],
      providerUrlsTableOptions: {
        search: false,
        showHeader: false,
        showColumns: false,
        showRefresh: false,
        pagination: true,
        silentSort: false,
        sidePagination: 'client',
        queryParamsType: 'pageSize',
        pageList: '[5, 10, 25]',
        pageSize: 5,
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
      },
      endpointTableColumns: [
        {
          title: this.$t('message.urls'),
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(row, ''));
          },
        },
      ],
      endpointTableOptions: {
        search: false,
        showColumns: false,
        showRefresh: false,
        pagination: true,
        silentSort: false,
        sidePagination: 'client',
        queryParamsType: 'pageSize',
        pageList: '[5, 10, 25]',
        pageSize: 5,
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
      },
      dataTableColumns: [
        {
          title: this.$t('message.classification'),
          field: 'name',
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.direction'),
          field: 'direction',
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
      ],
      dataTableOptions: {
        search: false,
        showColumns: false,
        showRefresh: false,
        pagination: true,
        silentSort: false,
        sidePagination: 'client',
        queryParamsType: 'pageSize',
        pageList: '[5, 10, 25]',
        pageSize: 5,
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
      },
      referencesTableColumns: [
        {
          title: this.$t('message.url'),
          field: 'url',
          sortable: false,
          formatter(value, row, index) {
            let url = xssFilters.uriInUnQuotedAttr(
              common.valueWithDefault(value, ''),
            );
            return `<a href="${url}">${xssFilters.inHTMLData(
              common.valueWithDefault(value, ''),
            )}</a>`;
          },
        },
        {
          title: this.$t('message.type'),
          field: 'type',
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.comment'),
          field: 'comment',
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
      ],
      referencesTableOptions: {
        search: false,
        showColumns: false,
        showRefresh: false,
        pagination: true,
        silentSort: false,
        sidePagination: 'client',
        queryParamsType: 'pageSize',
        pageList: '[5, 10, 25]',
        pageSize: 5,
        icons: {
          refresh: 'fa-refresh',
        },
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader('X-Total-Count');
          return res;
        },
      },
    };
  },
  methods: {
    updateService: function () {
      this.$root.$emit('bv::hide::modal', 'serviceDetailsModal');
      let url = `${this.$api.BASE_URL}/${this.$api.URL_SERVICE}`;
      console.log(this.service);
      this.axios
        .post(url, this.service)
        .then((response) => {
          this.$emit('serviceUpdated', response.data);
          this.$toastr.s(this.$t('message.service_updated'));
        })
        .catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    deleteService: function () {
      this.$root.$emit('bv::hide::modal', 'serviceDetailsModal');
      let url =
        `${this.$api.BASE_URL}/${this.$api.URL_SERVICE}/` + this.service.uuid;
      this.axios
        .delete(url)
        .then((response) => {
          this.$toastr.s(this.$t('message.service_deleted'));
          this.$router.replace({
            path: '/projects/' + this.service.project.uuid,
          });
        })
        .catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
  },
};
</script>

<style scoped>
.tab-content .tab-pane {
  padding: 0 !important;
}
.tab-content {
  border: 0 !important;
}
.card {
  border: 0;
  padding: 0;
  margin-bottom: 0;
}
</style>
