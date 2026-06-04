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
        <date-time-range-filter-pill
          v-if="isFilterVisible('published')"
          ref="filter_published"
          :field-label="$t('message.published')"
          field-name="package_artifact_published"
          icon="fa-calendar"
          date-only
          emit-date-as-millis
          v-model="publishedFilter"
          @dismiss="onFilterDismiss('published')"
        />
        <boolean-filter-pill
          v-if="isFilterVisible('showInactive')"
          :field-label="$t('message.show_inactive_projects')"
          field-name="showInactive"
          icon="fa-eye"
          v-model="showInactive"
        />
        <boolean-filter-pill
          v-if="isFilterVisible('onlyLatestVersion')"
          :field-label="$t('message.only_latest_project_versions')"
          field-name="onlyLatestVersion"
          icon="fa-bookmark"
          v-model="onlyLatestVersion"
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
      :extra-query-params="extraQueryParams"
      :columns="columns"
      :options="tableOptions"
      page-size-storage-key="ComponentSearchPageSize"
      @visible-columns="onVisibleColumns"
    />
  </div>
</template>

<script>
import $ from 'jquery';
import Vue from 'vue';
import common from '../../../shared/common';
import bootstrapTableMixin from '../../../mixins/bootstrapTableMixin';
import permissionsMixin from '../../../mixins/permissionsMixin';
import filterPillsMixin from '../../../mixins/filterPillsMixin';
import xssFilters from 'xss-filters';
import SeverityProgressBar from '@/views/components/SeverityProgressBar';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';
import TextFilterPill from '@/views/components/TextFilterPill.vue';
import HashFilterPill from '@/views/components/HashFilterPill.vue';
import BooleanFilterPill from '@/views/components/BooleanFilterPill.vue';
import DateTimeRangeFilterPill from '@/views/components/DateTimeRangeFilterPill.vue';
import { buildHashVerificationColumn } from '@/shared/hashVerificationColumn';

const EXPAND_BY_COLUMN = {
  metrics: 'metrics',
  'package_artifact_metadata.published_at': 'package_artifact_metadata',
  'hash_verification.status': 'package_artifact_metadata',
};

const COLUMN_DEFAULT_VISIBILITY = {
  name: true,
  version: true,
  group: true,
  purl: true,
  internal: false,
  cpe: false,
  scope: false,
  swid_tag_id: false,
  'project.name': true,
  'resolved_license.license_id': false,
  'package_artifact_metadata.published_at': false,
  'hash_verification.status': false,
  last_inherited_risk_score: false,
  metrics: false,
};

function storedVisibility(field) {
  if (typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem(
    'ComponentSearchShow' + common.capitalize(field),
  );
  if (stored === null) return null;
  return stored === 'true';
}

function initialColumnVisible(field) {
  const stored = storedVisibility(field);
  return stored !== null ? stored : COLUMN_DEFAULT_VISIBILITY[field] === true;
}

export default {
  mixins: [bootstrapTableMixin, permissionsMixin, filterPillsMixin],
  components: {
    TokenPaginatedTable,
    TextFilterPill,
    HashFilterPill,
    BooleanFilterPill,
    DateTimeRangeFilterPill,
  },
  beforeMount() {
    const q = this.$route.query;
    if (q.group_contains)
      this.groupFilter = { operator: 'contains', value: q.group_contains };
    if (q.name_contains)
      this.nameFilter = { operator: 'contains', value: q.name_contains };
    if (q.version_contains)
      this.versionFilter = { operator: 'contains', value: q.version_contains };
    if (q.purl_prefix)
      this.purlFilter = { operator: 'starts_with', value: q.purl_prefix };
    if (q.cpe) this.cpeFilter = { operator: 'equals', value: q.cpe };
    if (q.swid_tag_id_contains)
      this.swidTagIdFilter = {
        operator: 'contains',
        value: q.swid_tag_id_contains,
      };
    if (q.hash && q.hash_type)
      this.hashFilter = { hashType: q.hash_type, hash: q.hash };
    if (
      q.package_artifact_published_since ||
      q.package_artifact_published_before
    ) {
      this.publishedFilter = {
        since: q.package_artifact_published_since
          ? Number(q.package_artifact_published_since)
          : null,
        before: q.package_artifact_published_before
          ? Number(q.package_artifact_published_before)
          : null,
      };
    }
    if (q.show_inactive === 'true') this.showInactive = true;
    if (q.project_latest_version === 'true') this.onlyLatestVersion = true;
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
        this.publishedFilter = null;
        this.showInactive = false;
        this.onlyLatestVersion = false;
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
      if (this.publishedFilter) {
        if (this.publishedFilter.since) {
          params.package_artifact_published_since = this.publishedFilter.since;
        }
        if (this.publishedFilter.before) {
          params.package_artifact_published_before =
            this.publishedFilter.before;
        }
      }
      if (!this.showInactive) params.project_state = 'ACTIVE';
      if (this.onlyLatestVersion) params.project_latest_version = 'true';
      return params;
    },
    buildUrlQueryParams() {
      const params = this.buildFilterParams();
      delete params.project_state;
      if (this.showInactive) params.show_inactive = 'true';
      return params;
    },
    onVisibleColumns(fields) {
      this.visibleColumns = fields;
    },
    initializeTooltips() {
      $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover',
      });
    },
    syncQueryParams() {
      const query = this.buildUrlQueryParams();
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
        {
          name: 'published',
          label: this.$t('message.published'),
          icon: 'fa-calendar',
        },
        {
          name: 'showInactive',
          label: this.$t('message.show_inactive_projects'),
          icon: 'fa-eye',
        },
        {
          name: 'onlyLatestVersion',
          label: this.$t('message.only_latest_project_versions'),
          icon: 'fa-bookmark',
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
    extraQueryParams() {
      const expand = new Set();
      for (const field of this.visibleColumns) {
        if (EXPAND_BY_COLUMN[field]) {
          expand.add(EXPAND_BY_COLUMN[field]);
        }
      }
      if (expand.size === 0) {
        return {};
      }
      return { expand: [...expand] };
    },
  },
  data() {
    return {
      visibleColumns: [],
      groupFilter: null,
      nameFilter: null,
      versionFilter: null,
      purlFilter: null,
      cpeFilter: null,
      swidTagIdFilter: null,
      hashFilter: null,
      publishedFilter: null,
      showInactive: false,
      onlyLatestVersion: false,
      booleanFilters: ['showInactive', 'onlyLatestVersion'],
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
          visible: initialColumnVisible('name'),
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
          sortable: false,
          visible: initialColumnVisible('version'),
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.group'),
          field: 'group',
          sortable: true,
          visible: initialColumnVisible('group'),
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.package_url'),
          field: 'purl',
          sortable: false,
          visible: initialColumnVisible('purl'),
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.internal'),
          field: 'internal',
          sortable: false,
          visible: initialColumnVisible('internal'),
          align: 'center',
          class: 'tight',
          formatter: function (value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('message.cpe'),
          field: 'cpe',
          sortable: false,
          visible: initialColumnVisible('cpe'),
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.scope'),
          field: 'scope',
          sortable: false,
          visible: initialColumnVisible('scope'),
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.swid_tagid'),
          field: 'swid_tag_id',
          sortable: false,
          visible: initialColumnVisible('swid_tag_id'),
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.project_name'),
          field: 'project.name',
          sortable: false,
          visible: initialColumnVisible('project.name'),
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
          visible: initialColumnVisible('resolved_license.license_id'),
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
          title: this.$t('message.published'),
          field: 'package_artifact_metadata.published_at',
          sortable: false,
          visible: initialColumnVisible(
            'package_artifact_metadata.published_at',
          ),
          formatter(value) {
            if (value == null) {
              return '';
            }
            return xssFilters.inHTMLData(common.formatTimestamp(value));
          },
        },
        buildHashVerificationColumn({
          $t: this.$t.bind(this),
          vueFormatter: this.vueFormatter,
          visible: initialColumnVisible('hash_verification.status'),
        }),
        {
          title: this.$t('message.risk_score'),
          field: 'last_inherited_risk_score',
          sortable: true,
          visible: initialColumnVisible('last_inherited_risk_score'),
          class: 'tight',
        },
        {
          title: this.$t('message.vulnerabilities'),
          field: 'metrics',
          sortable: false,
          visible: initialColumnVisible('metrics'),
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
            const html = progressBar.$el.outerHTML;
            progressBar.$destroy();
            return html;
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
        onPostBody: () => {
          this.vueFormatterInit();
          this.initializeTooltips();
        },
        onSort: (name, order) => {
          this.sortBy = name;
          this.sortDirection = order;
        },
        onColumnSwitch: (field, checked) => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(
              'ComponentSearchShow' + common.capitalize(field),
              checked.toString(),
            );
          }
        },
      },
    };
  },
};
</script>

<style scoped src="../../components/filter-pills.css"></style>
