<template>
  <div>
    <!--
    For some reason, this has to be here. If the bootstrap-table is the only element in the template and the
    dropdown for version is changes, the table will not update. For whatever reason, adding the toolbar fixes it.
    -->
    <filter-bar
      toolbar-id="findingsToolbar"
      :add-filter-options="addFilterOptions"
      :active-filter-count="activeFilterCount"
      @show-filter="showFilter"
      @clear-all="clearAllFilters"
    >
      <boolean-filter-pill
        v-if="isFilterVisible('showSuppressedFindings')"
        :field-label="$t('message.show_suppressed_findings')"
        field-name="showSuppressedFindings"
        icon="fa-eye"
        v-model="showSuppressedFindings"
      />
      <boolean-filter-pill
        v-if="isFilterVisible('showKevOnly')"
        :field-label="$t('message.kev')"
        field-name="showKevOnly"
        icon="fa-crosshairs"
        v-model="showKevOnly"
      />
    </filter-bar>

    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-load-success="tableLoaded"
    >
    </bootstrap-table>
  </div>
</template>

<script>
import $ from 'jquery';
import xssFilters from 'xss-filters';

import common from '@/shared/common';
import i18n from '@/i18n';
import {
  applyTotalCountHeaders,
  compareVersions,
  loadUserPreferencesForBootstrapTable,
} from '@/shared/utils';
import bootstrapTableMixin from '@/mixins/bootstrapTableMixin';
import filterPillsMixin from '@/mixins/filterPillsMixin';
import FindingAudit from './FindingAudit';
import FilterBar from '@/views/components/FilterBar.vue';
import BooleanFilterPill from '@/views/components/BooleanFilterPill.vue';
import KevAssertionsModal from '@/views/components/KevAssertionsModal.vue';

export default {
  props: {
    uuid: String,
  },
  mixins: [bootstrapTableMixin, filterPillsMixin],
  components: {
    FilterBar,
    BooleanFilterPill,
    KevAssertionsModal,
  },
  beforeCreate() {
    this.showSuppressedFindings =
      !!localStorage &&
      localStorage.getItem('ProjectFindingsShowSuppressedFindings') === 'true';
    this.showKevOnly =
      !!localStorage &&
      localStorage.getItem('ProjectFindingsShowKevOnly') === 'true';

    if (this.$route.params.vulnerability) {
      if (this.$route.params.affectedComponent) {
        // search for the last portion of the finding's matrix ID
        this.initialSearchText =
          this.$route.params.affectedComponent +
          ':' +
          this.$route.params.vulnerability;
      } else {
        this.initialSearchText = this.$route.params.vulnerability;
      } // the route doesn't allow a component to be specified without a vulnerability
    }
  },
  data() {
    return {
      showSuppressedFindings: this.showSuppressedFindings,
      showKevOnly: this.showKevOnly,
      booleanFilters: ['showSuppressedFindings', 'showKevOnly'],
      columns: [
        {
          title: this.$t('message.component'),
          field: 'component.name',
          sortable: true,
          formatter: (value, row, index) => {
            let url = xssFilters.uriInUnQuotedAttr(
              '../../../components/' + row.component.uuid,
            );
            let dependencyGraphUrl = xssFilters.uriInUnQuotedAttr(
              '../../../projects/' +
                this.uuid +
                '/dependencyGraph/' +
                row.component.uuid,
            );
            return (
              `<a href="${dependencyGraphUrl}"<i class="fa fa-sitemap" aria-hidden="true" style="float:right; padding-top: 4px; cursor:pointer" data-toggle="tooltip" data-placement="bottom" title="Show in dependency graph"></i></a> ` +
              `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`
            );
          },
        },
        {
          title: this.$t('message.version'),
          field: 'component.version',
          sortable: true,
          formatter(value, row, index) {
            if (row.component.latestVersion) {
              if (
                compareVersions(
                  row.component.latestVersion,
                  row.component.version,
                ) > 0
              ) {
                return (
                  '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Risk: Outdated component. Current version is: ' +
                  xssFilters.inHTMLData(row.component.latestVersion) +
                  '"><i class="fa fa-exclamation-triangle status-warning" aria-hidden="true"></i></span> ' +
                  xssFilters.inHTMLData(row.component.version)
                );
              } else if (
                compareVersions(
                  row.component.latestVersion,
                  row.component.version,
                ) < 0
              ) {
                // should be unstable then
                return (
                  '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Risk: Unstable component. Current stable version is: ' +
                  xssFilters.inHTMLData(row.component.latestVersion) +
                  '"><i class="fa fa-exclamation-circle" aria-hidden="true"></i></span> ' +
                  xssFilters.inHTMLData(row.component.version)
                );
              } else {
                return (
                  '<span style="float:right" data-toggle="tooltip" data-placement="bottom" title="Component version is the latest available from the configured repositories"><i class="fa fa-check status-passed" aria-hidden="true"></i></span> ' +
                  xssFilters.inHTMLData(row.component.version)
                );
              }
            } else {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
            }
          },
        },
        {
          title: this.$t('message.group'),
          field: 'component.group',
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.vulnerability'),
          field: 'vulnerability.vulnId',
          sortable: true,
          formatter(value, row, index) {
            let url = xssFilters.uriInUnQuotedAttr(
              '../../../vulnerabilities/' +
                row.vulnerability.source +
                '/' +
                encodeURIComponent(value),
            );
            return (
              common.formatSourceLabel(row.vulnerability.source) +
              ` <a href="${url}">${xssFilters.inHTMLData(value)}</a>`
            );
          },
        },
        {
          title: this.$t('message.aliases'),
          field: 'vulnerability.aliases',
          visible: false,
          formatter(value, row, index) {
            if (typeof value !== 'undefined') {
              let label = '';
              const aliases = common.resolveVulnAliases(
                row.vulnerability.source,
                value,
              );
              for (let i = 0; i < aliases.length; i++) {
                let alias = aliases[i];
                let url = xssFilters.uriInUnQuotedAttr(
                  '../../../vulnerabilities/' +
                    alias.source +
                    '/' +
                    encodeURIComponent(alias.vulnId),
                );
                label +=
                  common.formatSourceLabel(alias.source) +
                  ` <a href="${url}">${xssFilters.inHTMLData(
                    alias.vulnId,
                  )}</a>`;
                if (i < aliases.length - 1) label += '<br/><br/>';
              }
              return label;
            }
          },
        },
        {
          title: this.$t('message.cwe'),
          field: 'vulnerability.cwes',
          sortable: true,
          visible: false,
          formatter(value, row, index) {
            if (typeof value !== 'undefined') {
              let label = '';
              for (let i = 0; i < value.length; i++) {
                label += common.formatCweShortLabel(
                  value[i].cweId,
                  value[i].name,
                );
                if (i < value.length - 1) label += ', ';
              }
              return label;
            }
          },
        },
        {
          title: this.$t('message.severity'),
          field: 'vulnerability.severity',
          sortName: 'vulnerability.severity',
          sortable: true,
          formatter(value, row, index) {
            if (typeof value !== 'undefined') {
              return common.formatSeverityLabel(value);
            }
          },
        },
        {
          title: this.$t('message.kev'),
          field: 'vulnerability.isKev',
          sortable: false,
          class: 'tight',
          formatter: (value, row, index) => {
            if (value !== true) {
              return '';
            }
            return this.vueFormatter({
              i18n,
              components: { KevAssertionsModal },
              template: `
                <div class="text-center">
                  <b-link
                    v-b-modal="\`kevAssertionsModal-${index}\`"
                    :title="$t('message.kev_show_assertions')"
                    class="text-danger"
                    style="border-bottom: 1px dashed currentColor; padding-bottom: 3px; cursor: pointer; white-space: nowrap; text-decoration: none;"
                  ><i class="fa fa-crosshairs" /> {{ $t('message.yes') }}</b-link>
                  <kev-assertions-modal :source="source" :vuln-id="vulnId" :index="index"/>
                </div>`,
              data() {
                return {
                  index: index,
                  source: row.vulnerability.source,
                  vulnId: row.vulnerability.vulnId,
                };
              },
            });
          },
        },
        {
          title: this.$t('message.analyzer'),
          field: 'attribution.analyzerIdentity',
          sortable: true,
          formatter(value, row, index) {
            return common.formatAnalyzerLabel(
              row.attribution.analyzerIdentity,
              row.vulnerability.source,
              row.vulnerability.vulnId,
              row.attribution.alternateIdentifier,
              row.attribution.referenceUrl,
            );
          },
        },
        {
          title: this.$t('message.attributed_on'),
          field: 'attribution.attributedOn',
          sortable: true,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.formatTimestamp(value));
          },
        },
        {
          title: this.$t('message.analysis'),
          field: 'analysis.state',
          sortable: true,
          formatter: common.makeAnalysisStateLabelFormatter(this),
        },
        {
          title: this.$t('message.suppressed'),
          field: 'analysis.isSuppressed',
          sortable: true,
          class: 'tight',
          formatter(value, row, index) {
            return value === true ? '<i class="fa fa-check-square-o" />' : '';
          },
        },
        {
          title: this.$t('message.matrix'),
          field: 'matrix',
          sortable: true,
          visible: false,
        },
      ],
      data: [],
      options: {
        onPostBody: () => {
          this.vueFormatterInit();
          this.initializeTooltips();
        },
        search: true,
        showColumns: true,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        sidePagination: 'server',
        toolbar: '#findingsToolbar',
        queryParamsType: 'pageSize',
        pageList: '[10, 25, 50, 100]',
        pageSize:
          localStorage &&
          localStorage.getItem('ProjectFindingsPageSize') !== null
            ? Number(localStorage.getItem('ProjectFindingsPageSize'))
            : 10,
        sortName:
          localStorage &&
          localStorage.getItem('ProjectFindingsSortName') !== null
            ? localStorage.getItem('ProjectFindingsSortName')
            : undefined,
        sortOrder:
          localStorage &&
          localStorage.getItem('ProjectFindingsSortOrder') !== null
            ? localStorage.getItem('ProjectFindingsSortOrder')
            : undefined,
        searchText: this.initialSearchText,
        icons: {
          detailOpen: 'fa-fw fa-angle-right',
          detailClose: 'fa-fw fa-angle-down',
          refresh: 'fa-refresh',
        },
        detailView: true,
        detailViewIcon: true,
        detailViewByClick: false,
        detailFormatter: (index, row) => {
          return (
            row &&
            this.vueFormatter({
              i18n,
              propsData: {
                finding: row,
                projectUuid: this.uuid,
              },
              ...FindingAudit,
            })
          );
        },
        onExpandRow: this.vueFormatterInit,
        responseHandler: function (res, xhr) {
          return applyTotalCountHeaders(res, xhr, this);
        },
        url: this.apiUrl(),
        onPageChange: (number, size) => {
          if (localStorage) {
            localStorage.setItem('ProjectFindingsPageSize', size.toString());
          }
        },
        onColumnSwitch: (field, checked) => {
          if (localStorage) {
            localStorage.setItem(
              'ProjectFindingsShow' + common.capitalize(field),
              checked.toString(),
            );
          }
        },
        onSort: (name, order) => {
          if (localStorage) {
            localStorage.setItem('ProjectFindingsSortName', name);
            localStorage.setItem('ProjectFindingsSortOrder', order);
          }
        },
      },
    };
  },
  methods: {
    apiUrl: function () {
      const url = `${this.$api.BASE_URL}/${this.$api.URL_FINDING}/project/${this.uuid}`;
      return common.setQueryParams(url, {
        suppressed: this.showSuppressedFindings === true,
        isKev: this.showKevOnly === true ? true : null,
        totalCount: 'BOUNDED',
      });
    },
    refreshTable: function () {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        pageNumber: 1,
        silent: true,
      });
    },
    tableLoaded: function (data) {
      loadUserPreferencesForBootstrapTable(
        this,
        'ProjectFindings',
        this.$refs.table.columns,
      );
      // the unfiltered length
      const boundedTotal = this.$refs.table.getOptions().boundedTotal;
      this.$emit('total', boundedTotal ? `${boundedTotal}+` : data.total);
      if (
        this.$route.params.vulnerability &&
        this.$refs.table.getData().length === 1
      ) {
        // If there's only one visible row due to a URL that selects a single finding, show it in full
        // Don't expand if there are multiple findings, as it makes it harder to notice that there is more than one result
        this.$refs.table.expandRow(0);
      }
    },
    persistFilter: function (key, value) {
      if (localStorage) {
        localStorage.setItem(key, value.toString());
      }
    },
    initializeTooltips: function () {
      $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover',
      });
    },
  },
  computed: {
    allFilterDefs() {
      return [
        {
          name: 'showKevOnly',
          label: this.$t('message.kev'),
          icon: 'fa-crosshairs',
        },
        {
          name: 'showSuppressedFindings',
          label: this.$t('message.show_suppressed_findings'),
          icon: 'fa-eye',
        },
      ];
    },
  },
  watch: {
    showSuppressedFindings(value) {
      this.persistFilter('ProjectFindingsShowSuppressedFindings', value);
    },
    showKevOnly(value) {
      this.persistFilter('ProjectFindingsShowKevOnly', value);
    },
  },
};
</script>
