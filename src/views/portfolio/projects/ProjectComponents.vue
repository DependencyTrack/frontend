<template>
  <div>
    <filter-bar
      toolbar-id="componentsToolbar"
      :add-filter-options="addFilterOptions"
      :active-filter-count="activeFilterCount"
      @show-filter="showFilter"
      @clear-all="clearAllFilters"
    >
      <boolean-filter-pill
        v-if="isFilterVisible('onlyOutdated')"
        :field-label="$t('message.outdated')"
        field-name="onlyOutdated"
        icon="fa-exclamation-triangle"
        v-model="onlyOutdated"
      />
      <boolean-filter-pill
        v-if="isFilterVisible('onlyDirect')"
        :field-label="$t('message.direct')"
        field-name="onlyDirect"
        icon="fa-level-down"
        v-model="onlyDirect"
      />
      <template #actions>
        <b-button
          size="sm"
          variant="outline-primary"
          :title="$t('message.add_component')"
          v-b-modal.projectAddComponentModal
          v-permission:or="[
            PERMISSIONS.PORTFOLIO_MANAGEMENT,
            PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
          ]"
        >
          <span class="fa fa-plus" aria-hidden="true"></span>
          {{ $t('message.add') }}
        </b-button>
        <b-button
          size="sm"
          variant="outline-danger"
          :disabled="selectedCount === 0"
          :title="
            selectedCount === 0
              ? $t('message.remove_component_select_first')
              : $t('message.remove_component')
          "
          @click="removeDependencies"
          v-permission:or="[
            PERMISSIONS.PORTFOLIO_MANAGEMENT,
            PERMISSIONS.PORTFOLIO_MANAGEMENT_DELETE,
          ]"
        >
          <span class="fa fa-trash" aria-hidden="true"></span>
          {{ $t('message.remove') }}
        </b-button>
        <b-dropdown
          size="sm"
          variant="outline-primary"
          :title="$t('message.download_component')"
          v-permission="PERMISSIONS.VIEW_PORTFOLIO"
        >
          <template #button-content>
            <span class="fa fa-download" aria-hidden="true"></span>
            {{ $t('message.download') }}
          </template>
          <b-dropdown-item @click="downloadTable('csv')" href="#">{{
            $t('message.csv_filetype')
          }}</b-dropdown-item>
        </b-dropdown>
      </template>
    </filter-bar>
    <token-paginated-table
      ref="table"
      :base-url="tableBaseUrl"
      :extra-query-params="extraQueryParams"
      :columns="columns"
      :options="tableOptions"
      page-size-storage-key="ProjectComponentsPageSize"
      @total="onTotal"
      @visible-columns="onVisibleColumns"
    />
    <project-add-component-modal
      :uuid="this.uuid"
      v-on:refreshTable="onComponentAdded"
    />
  </div>
</template>

<script>
import { compareVersions } from '@/shared/utils';
import ComponentOccurrenceListModal from '@/views/portfolio/projects/ComponentOccurrenceListModal.vue';
import ProjectAddComponentModal from '@/views/portfolio/projects/ProjectAddComponentModal';
import TokenPaginatedTable from '@/views/components/TokenPaginatedTable.vue';
import FilterBar from '@/views/components/FilterBar.vue';
import BooleanFilterPill from '@/views/components/BooleanFilterPill.vue';
import $ from 'jquery';
import Vue from 'vue';
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import common from '../../../shared/common';
import SeverityProgressBar from '../../components/SeverityProgressBar';
import { get } from 'lodash-es';
import i18n from '@/i18n';
import bootstrapTableMixin from '@/mixins/bootstrapTableMixin';
import filterPillsMixin from '@/mixins/filterPillsMixin';
import { buildHashVerificationColumn } from '@/shared/hashVerificationColumn';

const EXPAND_BY_COLUMN = {
  metrics: 'metrics',
  version: 'package_metadata',
  latest_version: 'package_metadata',
  occurrence_count: 'occurrence_count',
  'package_artifact_metadata.published_at': 'package_artifact_metadata',
  'hash_verification.status': 'package_artifact_metadata',
};

const COLUMN_DEFAULT_VISIBILITY = {
  name: true,
  version: true,
  'package_artifact_metadata.published_at': false,
  latest_version: false,
  group: true,
  classifier: false,
  scope: false,
  is_internal: true,
  'hash_verification.status': false,
  license: true,
  occurrence_count: false,
  last_inherited_risk_score: true,
  metrics: true,
};

function storedVisibility(field) {
  if (!localStorage) return null;
  const stored = localStorage.getItem(
    'ProjectComponentsShow' + common.capitalize(field),
  );
  if (stored === null) return null;
  return stored === 'true';
}

function initialColumnVisible(field) {
  const stored = storedVisibility(field);
  return stored !== null ? stored : COLUMN_DEFAULT_VISIBILITY[field] === true;
}

function readSort() {
  const def = { name: 'name', order: 'asc' };
  if (!localStorage) return def;
  return {
    name: localStorage.getItem('ProjectComponentsSortName') ?? def.name,
    order: localStorage.getItem('ProjectComponentsSortOrder') ?? def.order,
  };
}

export default {
  components: {
    BooleanFilterPill,
    FilterBar,
    ProjectAddComponentModal,
    TokenPaginatedTable,
  },
  mixins: [bootstrapTableMixin, filterPillsMixin, permissionsMixin],
  props: {
    uuid: String,
    project: Object,
  },
  data() {
    const initialVisibleColumns = Object.keys(COLUMN_DEFAULT_VISIBILITY).filter(
      (f) => initialColumnVisible(f),
    );
    const sort = readSort();
    return {
      onlyOutdated: false,
      onlyDirect: false,
      booleanFilters: ['onlyOutdated', 'onlyDirect'],
      selectedCount: 0,
      searchText: null,
      visibleColumns: initialVisibleColumns,
      columns: this.buildColumns(),
      tableOptions: {
        toolbar: '#componentsToolbar',
        search: true,
        searchable: false,
        onSearch: (text) => {
          this.searchText = text;
        },
        queryParams: () => ({}),
        onPostBody: () => {
          this.vueFormatterInit();
          this.initializeTooltips();
          // Reloading a page rebuilds the rows, dropping any selection.
          this.updateSelectionCount();
        },
        onCheck: () => this.updateSelectionCount(),
        onUncheck: () => this.updateSelectionCount(),
        onCheckAll: () => this.updateSelectionCount(),
        onUncheckAll: () => this.updateSelectionCount(),
        onColumnSwitch: (field, checked) => {
          if (localStorage) {
            localStorage.setItem(
              'ProjectComponentsShow' + common.capitalize(field),
              checked.toString(),
            );
          }
        },
        onSort: (name, order) => {
          this.sortBy = name;
          this.sortDirection = order;
          if (localStorage) {
            localStorage.setItem('ProjectComponentsSortName', name);
            localStorage.setItem('ProjectComponentsSortOrder', order);
          }
        },
        sortName: sort.name,
        sortOrder: sort.order,
      },
      sortBy: sort.name,
      sortDirection: sort.order,
    };
  },
  computed: {
    allFilterDefs() {
      const defs = [
        {
          name: 'onlyOutdated',
          label: this.$t('message.outdated'),
          description: this.$t('message.only_outdated_tooltip'),
          icon: 'fa-exclamation-triangle',
        },
      ];
      if (this.project && this.project.directDependencies) {
        defs.push({
          name: 'onlyDirect',
          label: this.$t('message.direct'),
          description: this.$t('message.only_direct_tooltip'),
          icon: 'fa-level-down',
        });
      }
      return defs;
    },
    componentsUrl() {
      return `${this.$api.BASE_URL}/api/v2/projects/${this.uuid}/components`;
    },
    tableBaseUrl() {
      return common.setQueryParams(this.componentsUrl, this.buildBaseParams());
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
  methods: {
    buildBaseParams() {
      const params = {
        only_outdated: this.onlyOutdated ? 'true' : 'false',
        only_direct: this.onlyDirect ? 'true' : 'false',
        sort_by: this.sortBy || 'name',
        sort_direction: (this.sortDirection || 'asc').toUpperCase(),
      };
      if (this.searchText) {
        params.q = this.searchText;
      }
      return params;
    },
    buildColumns() {
      return [
        {
          field: 'state',
          checkbox: true,
          align: 'center',
        },
        {
          title: this.$t('message.component'),
          field: 'name',
          sortable: true,
          visible: initialColumnVisible('name'),
          formatter: (value, row) => {
            let url = xssFilters.uriInUnQuotedAttr(
              '../../../components/' + row.uuid,
            );
            let dependencyGraphUrl = xssFilters.uriInUnQuotedAttr(
              '../../../projects/' + this.uuid + '/dependencyGraph/' + row.uuid,
            );
            return (
              `<a href="${dependencyGraphUrl}"<i class="fa fa-sitemap" aria-hidden="true" style="float:right; padding-top: 4px; cursor:pointer" data-toggle="tooltip" data-placement="bottom" title="Show in dependency graph"></i></a> ` +
              `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`
            );
          },
        },
        {
          title: this.$t('message.version'),
          field: 'version',
          sortable: false,
          visible: initialColumnVisible('version'),
          formatter: (value, row) => {
            const latest =
              row.package_metadata && row.package_metadata.latest_version
                ? row.package_metadata.latest_version
                : null;
            if (latest) {
              const cmp = compareVersions(latest, row.version);
              if (cmp > 0) {
                return (
                  '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Risk: Outdated component. Current version is: ' +
                  xssFilters.inHTMLData(latest) +
                  '"><i class="fa fa-exclamation-triangle status-warning" aria-hidden="true"></i></span> ' +
                  xssFilters.inHTMLData(row.version)
                );
              } else if (cmp < 0) {
                return (
                  '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Risk: Unstable component. Current stable version is: ' +
                  xssFilters.inHTMLData(latest) +
                  '"><i class="fa fa-exclamation-circle" aria-hidden="true"></i></span> ' +
                  xssFilters.inHTMLData(row.version)
                );
              }
              return (
                '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Component version is the latest available from the configured repositories"><i class="fa fa-check status-passed" aria-hidden="true"></i></span> ' +
                xssFilters.inHTMLData(row.version)
              );
            }
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.published'),
          field: 'package_artifact_metadata.published_at',
          sortable: true,
          visible: initialColumnVisible(
            'package_artifact_metadata.published_at',
          ),
          formatter(value) {
            if (value != null) {
              return xssFilters.inHTMLData(common.formatTimestamp(value));
            }
            return '';
          },
        },
        {
          title: this.$t('message.latest_version'),
          field: 'latest_version',
          sortable: false,
          visible: initialColumnVisible('latest_version'),
          formatter(_, row) {
            const latest =
              row.package_metadata && row.package_metadata.latest_version
                ? row.package_metadata.latest_version
                : '';
            return xssFilters.inHTMLData(latest);
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
          title: this.$t('message.classifier'),
          field: 'classifier',
          sortable: false,
          visible: initialColumnVisible('classifier'),
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
          title: this.$t('message.internal'),
          field: 'is_internal',
          sortable: false,
          visible: initialColumnVisible('is_internal'),
          align: 'center',
          class: 'tight',
          formatter(value) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        buildHashVerificationColumn({
          $t: this.$t.bind(this),
          vueFormatter: this.vueFormatter,
          visible: initialColumnVisible('hash_verification.status'),
        }),
        {
          title: this.$t('message.license'),
          field: 'license',
          sortable: false,
          visible: initialColumnVisible('license'),
          formatter(value, row) {
            if (row.resolved_license) {
              const licenseurl =
                '../../../licenses/' + row.resolved_license.license_id;
              return (
                '<a href="' +
                licenseurl +
                '">' +
                xssFilters.inHTMLData(row.resolved_license.license_id) +
                '</a>'
              );
            } else if (value) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
            } else if (row.license_expression) {
              return xssFilters.inHTMLData(
                common.valueWithDefault(row.license_expression, ''),
              );
            }
            return '';
          },
        },
        {
          title: this.$t('message.occurrences'),
          field: 'occurrence_count',
          sortable: false,
          class: 'tight',
          visible: initialColumnVisible('occurrence_count'),
          formatter: (value, row, index) => {
            if (value) {
              return this.vueFormatter({
                i18n,
                components: { ComponentOccurrenceListModal },
                template: `
                  <div>
                    <b-link v-b-modal="\`componentOccurrenceListModal-${index}\`">{{ value }}</b-link>
                    <component-occurrence-list-modal :component-uuid="componentUuid" :component-name="componentName" :index="index"/>
                  </div>`,
                data() {
                  return {
                    index: index,
                    componentUuid: row.uuid,
                    componentName: row.name,
                    value: value,
                  };
                },
              });
            }
            return `<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="${this.$t('message.occurrences_none_hint')}"><i class="fa fa-question-circle" aria-hidden="true"></i></span> ${value}`;
          },
        },
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
          formatter: (metrics) => {
            if (metrics == null) {
              return '-';
            }
            const ComponentClass = Vue.extend(SeverityProgressBar);
            const progressBar = new ComponentClass({
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
          },
        },
      ];
    },
    initializeTooltips() {
      $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover',
      });
    },
    onVisibleColumns(fields) {
      this.visibleColumns = fields;
    },
    onTotal(total) {
      this.$emit('total', total != null ? total : '?');
    },
    removeDependencies() {
      const bt = this.innerBootstrapTable();
      if (!bt) return;
      const selections = bt.getSelections();
      if (selections.length === 0) return;
      for (let i = 0; i < selections.length; i++) {
        const url = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/${selections[i].uuid}`;
        this.axios
          .delete(url)
          .then(() => {
            if (this.$refs.table) {
              this.$refs.table.refreshCurrentPage();
            }
            this.$toastr.s(this.$t('message.component_deleted'));
          })
          .catch(() => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
      }
      bt.uncheckAll();
    },
    updateSelectionCount() {
      const bt = this.innerBootstrapTable();
      this.selectedCount = bt ? bt.getSelections().length : 0;
    },
    innerBootstrapTable() {
      return this.$refs.table && this.$refs.table.$refs
        ? this.$refs.table.$refs.table
        : null;
    },
    buildTableFile(items, fileType) {
      if (fileType !== 'csv') {
        return;
      }
      const header = [
        'name',
        'version',
        'group',
        'is_internal',
        'resolved_license.license_id',
        'last_inherited_risk_score',
        'metrics.vulnerabilities',
      ];
      const csvEscape = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csv = [
        header.join(','),
        ...items.map((row) =>
          header.map((h) => csvEscape(get(row, h, ''))).join(','),
        ),
      ].join('\r\n');
      common.saveBlob(new Blob([csv]), 'componentTable.csv');
    },
    async downloadTable(fileType) {
      const result = await this.downloadAllComponents();
      if (result.partial) {
        this.$toastr.w(this.$t('message.component_download_partial'));
      }
      this.buildTableFile(result.items, fileType);
    },
    async downloadAllComponents() {
      const items = [];
      let url = common.setQueryParams(this.componentsUrl, {
        ...this.buildBaseParams(),
        limit: 100,
        expand: ['metrics', 'package_metadata'],
      });
      // Follow next_page_token until exhausted. Cap iterations to guard
      // against runaway loops if the backend misbehaves.
      for (let i = 0; i < 10000; i++) {
        let response;
        try {
          response = await this.axios.get(url);
        } catch (e) {
          console.error(e);
          return { items, partial: true };
        }
        const pageItems = response.data.items || [];
        items.push(...pageItems);
        const nextToken = response.data.next_page_token;
        if (!nextToken) return { items, partial: false };
        url = common.setQueryParams(url, { page_token: nextToken });
      }
      return { items, partial: true };
    },
    onComponentAdded() {
      if (this.$refs.table) {
        this.$refs.table.refreshCurrentPage();
      }
    },
  },
};
</script>
