<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <portfolio-widget-row :fetch="true" />
    <b-row>
      <b-col md="4" lg="3">
        <b-input-group-form-select id="input-subject" required="true" v-model="subject" :options="subjects"/>
      </b-col>
      <b-col md="7" lg="6">
        <b-input-group-form-input v-if="subject !== 'COORDINATES'" id="input-value" required="true" type="text" v-model="value" lazy="true" v-on:keyup.enter="performSearch" />
        <b-input-group v-else-if="subject === 'COORDINATES'">
          <b-form-input id="input-value-coordinates-group" :placeholder="$t('message.group')" type="text" v-model="coordinatesGroup" v-on:keyup.enter="performSearch"></b-form-input>
          <b-form-input id="input-value-coordinates-name" :placeholder="$t('message.name')" type="text" v-model="coordinatesName" v-on:keyup.enter="performSearch"></b-form-input>
          <b-form-input id="input-value-coordinates-version" :placeholder="$t('message.version')" type="text" v-model="coordinatesVersion" v-on:keyup.enter="performSearch"></b-form-input>
        </b-input-group>
      </b-col>
      <b-col md="1" lg="1">
        <b-button variant="outline-primary" v-on:click="performSearch">{{ $t('message.search') }}</b-button>
      </b-col>
    </b-row>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options">
    </bootstrap-table>
  </div>
</template>

<script>
  import { Switch as cSwitch } from '@coreui/vue';
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";
  import permissionsMixin from "../../../mixins/permissionsMixin";
  import BInputGroupFormSelect from "../../../forms/BInputGroupFormSelect";
  import BInputGroupFormInput from "../../../forms/BInputGroupFormInput";
  import common from "../../../shared/common";
  import xssFilters from "xss-filters";
  import SeverityProgressBar from "@/views/components/SeverityProgressBar";

  export default {
    mixins: [permissionsMixin],
    components: {
      cSwitch,
      PortfolioWidgetRow,
      BInputGroupFormSelect,
      BInputGroupFormInput
    },
    methods: {
      createQueryParams: function() {
        if (this.subject === "COORDINATES") {
          let g = common.trimToNull(this.coordinatesGroup);
          let n = common.trimToNull(this.coordinatesName);
          let v = common.trimToNull(this.coordinatesVersion);
          return (g != null)? "group="+encodeURIComponent(g): "" + (n != null)? "name="+encodeURIComponent(n): "" + (v != null)? "version="+encodeURIComponent(v): "";
        } else if (this.subject === "PACKAGE_URL") {
          let v = common.trimToNull(this.value);
          return (v != null)? "purl="+encodeURIComponent(v): "";
        } else if (this.subject === "CPE") {
          let v = common.trimToNull(this.value);
          return (v != null)? "cpe="+encodeURIComponent(v): "";
        } else if (this.subject === "SWID_TAGID") {
          let v = common.trimToNull(this.value);
          return (v != null)? "swidTagId="+encodeURIComponent(v): "";
        }
      },
      performSearch: function() {
        if (this.subject === "HASH") {
          let hash = encodeURIComponent(common.trimToNull(this.value));
          this.options.url = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/hash/${hash}`;
          this.$refs.table.refresh({ silent: true });
        } else {
          let queryParams = this.createQueryParams();
          this.options.url = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/identity?${queryParams}`;
          this.$refs.table.refresh({ silent: true });
        }
      }
    },
    data() {
      return {
        subject: 'COORDINATES',
        value: null,
        coordinatesGroup: null,
        coordinatesName: null,
        coordinatesVersion: null,
        subjects: [
          {value: 'COORDINATES', text: this.$t('message.coordinates')},
          {value: 'PACKAGE_URL', text: this.$t('message.package_url')},
          {value: 'CPE', text: this.$t('message.cpe_full')},
          {value: 'SWID_TAGID', text: this.$t('message.swid_tagid')},
          {value: 'HASH', text: this.$t('message.hashes_short_desc')}
        ],
        columns: [
          {
            title: this.$t('message.component'),
            field: "name",
            sortable: true,
            formatter(value, row, index) {
              let url = xssFilters.uriInUnQuotedAttr("../components/" + row.uuid);
              return `<a href="${url}">${xssFilters.inHTMLData(value)}</a>`;
            }
          },
          {
            title: this.$t('message.version'),
            field: "version",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.group'),
            field: "group",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.package_url'),
            field: "purl",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.cpe'),
            field: "cpe",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.swid_tagid'),
            field: "swid",
            sortable: true,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('message.project_name'),
            field: "project.name",
            sortable: false,
            formatter(value, row, index) {
              let url = xssFilters.uriInUnQuotedAttr("../projects/" + row.project.uuid);
              let name = common.concatenateComponentName(null, row.project.name, row.project.version);
              return `<a href="${url}">${xssFilters.inHTMLData(name)}</a>`;
            }
          },
          {
            title: this.$t('message.risk_score'),
            field: "lastInheritedRiskScore",
            sortable: true,
            visible: false,
            class: "tight",
          },
          {
            title: this.$t('message.vulnerabilities'),
            field: "metrics",
            sortable: false,
            visible: false,
            formatter(metrics, row, index) {
              if (typeof metrics === "undefined") {
                return "-"; // No vulnerability info available
              }

              // Programmatically instantiate SeverityProgressBar Vue component
              let ComponentClass = Vue.extend(SeverityProgressBar);
              let progressBar = new ComponentClass({
                propsData: {
                  vulnerabilities: metrics.vulnerabilities,
                  critical: metrics.critical,
                  high: metrics.high,
                  medium: metrics.medium,
                  low: metrics.low,
                  unassigned: metrics.unassigned }
              });
              progressBar.$mount();
              return progressBar.$el.outerHTML;
            }
          }
        ],
        data: [],
        options: {
          onPostBody: this.initializeTooltips,
          search: false,
          showColumns: false,
          showRefresh: false,
          pagination: true,
          silentSort: false,
          sidePagination: 'server',
          queryParamsType: 'pageSize',
          pageList: '[10, 25, 50, 100]',
          pageSize: 10,
          icons: {
            refresh: 'fa-refresh'
          },
          //toolbar: '#componentSearchToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/identity`
        }
      };
    }
  };
</script>
