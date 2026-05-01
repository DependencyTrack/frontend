<template>
  <div class="componentSearch animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <div
      id="componentSearchToolbar"
      class="filter-bar"
      role="toolbar"
      :aria-label="$t('message.filters')"
    >
      <div class="filter-pills">
        <text-filter-pill
          v-if="isFilterVisible('group')"
          ref="filter_group"
          :field-label="$t('message.group')"
          field-name="group"
          icon="fa-archive"
          :operators="['contains']"
          v-model="groupFilter"
          @dismiss="onFilterDismiss('group')"
        />
        <text-filter-pill
          v-if="isFilterVisible('name')"
          ref="filter_name"
          :field-label="$t('message.name')"
          field-name="name"
          icon="fa-cube"
          :operators="['contains']"
          v-model="nameFilter"
          @dismiss="onFilterDismiss('name')"
        />
        <text-filter-pill
          v-if="isFilterVisible('version')"
          ref="filter_version"
          :field-label="$t('message.version')"
          field-name="version"
          icon="fa-bookmark-o"
          :operators="['contains']"
          v-model="versionFilter"
          @dismiss="onFilterDismiss('version')"
        />
        <text-filter-pill
          v-if="isFilterVisible('purl')"
          ref="filter_purl"
          :field-label="$t('message.package_url')"
          field-name="purl"
          icon="fa-gift"
          :operators="['starts_with']"
          v-model="purlFilter"
          @dismiss="onFilterDismiss('purl')"
        />
        <text-filter-pill
          v-if="isFilterVisible('cpe')"
          ref="filter_cpe"
          :field-label="$t('message.cpe')"
          field-name="cpe"
          icon="fa-shield"
          :operators="['equals']"
          v-model="cpeFilter"
          @dismiss="onFilterDismiss('cpe')"
        />
        <text-filter-pill
          v-if="isFilterVisible('swidTagId')"
          ref="filter_swidTagId"
          :field-label="$t('message.swid_tagid')"
          field-name="swid_tag_id"
          icon="fa-tag"
          :operators="['contains']"
          v-model="swidTagIdFilter"
          @dismiss="onFilterDismiss('swidTagId')"
        />
        <hash-filter-pill
          v-if="isFilterVisible('hash')"
          ref="filter_hash"
          field-name="hash"
          :field-label="$t('message.hashes_short_desc')"
          :hash-types="hashTypeOptions"
          v-model="hashFilter"
          @dismiss="onFilterDismiss('hash')"
        />
        <b-dropdown
          v-if="addFilterOptions.length > 0"
          size="sm"
          variant="outline-primary"
          class="btn-more-filters"
          no-caret
        >
          <template #button-content>
            <span class="fa fa-plus" aria-hidden="true"></span>
            {{ $t('message.add_filter') }}
          </template>
          <b-dropdown-item
            v-for="filter in addFilterOptions"
            :key="filter.name"
            @click="showFilter(filter.name)"
            ><span
              :class="['fa', filter.icon, 'mr-2']"
              aria-hidden="true"
            ></span
            >{{ filter.label }}</b-dropdown-item
          >
        </b-dropdown>
        <b-button
          v-show="activeFilterCount >= 2"
          size="sm"
          variant="outline-danger"
          class="btn-clear-all-filters"
          @click="clearAllFilters"
        >
          <span class="fa fa-remove" aria-hidden="true"></span>
          {{ $t('message.clear_all') }}
        </b-button>
      </div>
    </div>
    <token-paginated-table
      ref="table"
      :base-url="tableDataBaseUrl"
      :columns="columns"
      :options="tableOptions"
    />
  </div>
</template>

<script>
import Vue from 'vue';
import common from '../../../shared/common';
import permissionsMixin from '../../../mixins/permissionsMixin';
import filterPillsMixin from '../../../mixins/filterPillsMixin';
import xssFilters from 'xss-filters';
import SeverityProgressBar from '@/views/components/SeverityProgressBar';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';
import TextFilterPill from '@/views/components/TextFilterPill.vue';
import HashFilterPill from '@/views/components/HashFilterPill.vue';

export default {
  mixins: [permissionsMixin, filterPillsMixin],
  components: {
    TokenPaginatedTable,
    TextFilterPill,
    HashFilterPill,
  },
  beforeMount() {
    const q = this.$route.query;
    if (q.group)
      this.groupFilter = { operator: 'contains', value: q.group_contains };
    if (q.name)
      this.nameFilter = { operator: 'contains', value: q.name_contains };
    if (q.version)
      this.versionFilter = { operator: 'contains', value: q.version_contains };
    if (q.purl)
      this.purlFilter = { operator: 'starts_with', value: q.purl_prefix };
    if (q.cpe) this.cpeFilter = { operator: 'equals', value: q.cpe };
    if (q.swid_tag_id)
      this.swidTagIdFilter = {
        operator: 'contains',
        value: q.swid_tag_id_contains,
      };
    if (q.hash && q.hash_type)
      this.hashFilter = { hashType: q.hash_type, hash: q.hash };
  },
  methods: {
    clearAllFilters() {
      this._clearing = true;
      try {
        this.groupFilter = null;
        this.nameFilter = null;
        this.versionFilter = null;
        this.purlFilter = null;
        this.cpeFilter = null;
        this.swidTagIdFilter = null;
        this.hashFilter = null;
        this.clearPendingFilters();
      } finally {
        this._clearing = false;
      }
      this.syncQueryParams();
    },
    refreshTable() {
      this.syncQueryParams();
    },
    buildFilterParams() {
      const params = {};
      if (this.groupFilter && this.groupFilter.value)
        params.group_contains = this.groupFilter.value;
      if (this.nameFilter && this.nameFilter.value)
        params.name_contains = this.nameFilter.value;
      if (this.versionFilter && this.versionFilter.value)
        params.version_contains = this.versionFilter.value;
      if (this.purlFilter && this.purlFilter.value)
        params.purl_prefix = this.purlFilter.value;
      if (this.cpeFilter && this.cpeFilter.value)
        params.cpe = this.cpeFilter.value;
      if (this.swidTagIdFilter && this.swidTagIdFilter.value)
        params.swid_tag_id_contains = this.swidTagIdFilter.value;
      if (this.hashFilter && this.hashFilter.hash) {
        params.hash = this.hashFilter.hash;
        params.hash_type = this.hashFilter.hashType;
      }
      return params;
    },
    syncQueryParams() {
      const query = this.buildFilterParams();
      const currentQuery = this.$route.query;
      const keys = new Set([
        ...Object.keys(query),
        ...Object.keys(currentQuery),
      ]);
      const isSame = [...keys].every((k) => query[k] === currentQuery[k]);
      if (!isSame) {
        this.$router.replace({ query }).catch(() => {});
      }
    },
  },
  computed: {
    allFilterDefs() {
      return [
        {
          name: 'group',
          label: this.$t('message.group'),
          icon: 'fa-archive',
        },
        { name: 'name', label: this.$t('message.name'), icon: 'fa-cube' },
        {
          name: 'version',
          label: this.$t('message.version'),
          icon: 'fa-bookmark-o',
        },
        {
          name: 'purl',
          label: this.$t('message.package_url'),
          icon: 'fa-gift',
        },
        { name: 'cpe', label: this.$t('message.cpe'), icon: 'fa-shield' },
        {
          name: 'swidTagId',
          label: this.$t('message.swid_tagid'),
          icon: 'fa-tag',
        },
        {
          name: 'hash',
          label: this.$t('message.hashes_short_desc'),
          icon: 'fa-hashtag',
        },
      ];
    },
    tableDataBaseUrl() {
      const url = `${this.$api.BASE_URL}/api/v2/components`;
      const queryParams = this.buildFilterParams();
      const sortBy = this.sortBy || 'name';
      const sortDirection = this.sortDirection || 'asc';
      queryParams.sort_by = sortBy;
      queryParams.sort_direction = sortDirection.toUpperCase();
      return common.setQueryParams(url, queryParams);
    },
  },
  data() {
    return {
      groupFilter: null,
      nameFilter: null,
      versionFilter: null,
      purlFilter: null,
      cpeFilter: null,
      swidTagIdFilter: null,
      hashFilter: null,
      sortBy: null,
      sortDirection: null,
      hashTypeOptions: [
        { value: 'MD5', text: this.$t('hashes.md5') },
        { value: 'SHA1', text: this.$t('hashes.sha_1') },
        { value: 'SHA_256', text: this.$t('hashes.sha_256') },
        { value: 'SHA_384', text: this.$t('hashes.sha_384') },
        { value: 'SHA_512', text: this.$t('hashes.sha_512') },
        { value: 'SHA3_256', text: this.$t('hashes.sha3_256') },
        { value: 'SHA3_384', text: this.$t('hashes.sha3_384') },
        { value: 'SHA3_512', text: this.$t('hashes.sha3_512') },
        { value: 'BLAKE2b_256', text: this.$t('hashes.blake_256') },
        { value: 'BLAKE2b_384', text: this.$t('hashes.blake_384') },
        { value: 'BLAKE2b_512', text: this.$t('hashes.blake_512') },
        { value: 'BLAKE3', text: this.$t('hashes.blake3') },
      ],
      columns: [
        {
          title: this.$t('message.component'),
          field: 'name',
          sortable: true,
          formatter(value, row) {
            let url = xssFilters.uriInUnQuotedAttr('../components/' + row.uuid);
            let dependencyGraphUrl = xssFilters.uriInUnQuotedAttr(
              '../../../projects/' +
                row.project.uuid +
                '/dependencyGraph/' +
                row.uuid,
            );
            return (
              `<a href="${dependencyGraphUrl}>"<i class="fa fa-sitemap" aria-hidden="true" style="float:right; padding-top: 4px; cursor:pointer" data-toggle="tooltip" data-placement="bottom" title="Show in dependency graph"></i></a> ` +
              `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`
            );
          },
        },
        {
          title: this.$t('message.version'),
          field: 'version',
          sortable: true,
          visible: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.group'),
          field: 'group',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.package_url'),
          field: 'purl',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.internal'),
          field: 'internal',
          sortable: false,
          visible: false,
          align: 'center',
          class: 'tight',
          formatter: function (value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('message.cpe'),
          field: 'cpe',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.scope'),
          field: 'scope',
          sortable: false,
          visible: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.swid_tagid'),
          field: 'swid_tag_id',
          sortable: false,
          visible: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.project_name'),
          field: 'project.name',
          sortable: false,
          formatter(_, row) {
            let url = xssFilters.uriInUnQuotedAttr(
              '../projects/' + row.project.uuid,
            );
            let name = common.concatenateComponentName(
              null,
              row.project.name,
              row.project.version,
            );
            return `<a href="${url}">${xssFilters.inHTMLData(name)}</a>`;
          },
        },
        {
          title: this.$t('message.license_name'),
          field: 'resolved_license.license_id',
          sortable: false,
          visible: false,
          formatter(resolved_license, row) {
            if (typeof resolved_license === 'undefined') {
              return '-';
            }

            let url = xssFilters.uriInUnQuotedAttr(
              '../licenses/' +
                encodeURIComponent(row.resolved_license.license_id),
            );
            return `<a href="${url}">${xssFilters.inHTMLData(row.resolved_license.name)}</a>`;
          },
        },
        {
          title: this.$t('message.risk_score'),
          field: 'last_inherited_risk_score',
          sortable: true,
          visible: false,
          class: 'tight',
        },
        {
          title: this.$t('message.vulnerabilities'),
          field: 'metrics',
          sortable: false,
          visible: false,
          formatter: function (metrics) {
            if (typeof metrics === 'undefined') {
              return '-';
            }

            let ComponentClass = Vue.extend(SeverityProgressBar);
            let progressBar = new ComponentClass({
              propsData: {
                vulnerabilities: metrics.vulnerabilities,
                critical: metrics.critical,
                high: metrics.high,
                medium: metrics.medium,
                low: metrics.low,
                unassigned: metrics.unassigned,
                $t: this.$t.bind(this),
              },
            });
            progressBar.$mount();
            return progressBar.$el.outerHTML;
          }.bind(this),
        },
      ],
      tableOptions: {
        toolbar: '#componentSearchToolbar',
        showColumns: true,
        showRefresh: true,
        silentSort: false,
        icons: {
          refresh: 'fa-refresh',
        },
        sortName: 'name',
        sortOrder: 'asc',
        customSort: () => {},
        onSort: (name, order) => {
          this.sortBy = name;
          this.sortDirection = order;
        },
      },
    };
  },
};
</script>

<style scoped src="../../components/filter-pills.css"></style>
