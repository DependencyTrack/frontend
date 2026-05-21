



<template>
  <div>
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <b-button
        size="md"
        variant="outline-primary"
        @click="initializeProjectCreateProjectModal"
        v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT"
      >
        <span class="fa fa-plus"></span>
        {{ $t('message.create_project') }}
      </b-button>

      <c-switch
        style="margin-left: 1rem; margin-right: 0.5rem"
        id="showInactiveProjects"
        color="primary"
        v-model="showInactiveProjects"
        label
        v-bind="labelIcon"
        tabindex="0"
        role="switch"
        @keydown.enter.native="$event.target.click()"
        @keydown.space.native="$event.target.click()"
      />
      <span class="text-muted">
        {{ $t('message.show_inactive_projects') }}
      </span>

      <c-switch
        @click.native="saveViewState"
        style="margin-left: 1rem; margin-right: 0.5rem"
        id="showFlatView"
        color="primary"
        v-model="showFlatView"
        label
        v-bind="labelIcon"
        :disabled="isSearching"
        v-b-tooltip.hover
        :title="$t('message.switch_view')"
        tabindex="0"
        role="switch"
        @keydown.enter.native="$event.target.click()"
        @keydown.space.native="$event.target.click()"
      />
      <span class="text-muted">
        {{ $t('message.show_flat_view') }}
      </span>
    </div>

    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      @on-pre-body="onPreBody"
      @on-post-body="onPostBody"
      @on-load-success="onLoadSuccess"
    >
    </bootstrap-table>

    <project-create-project-modal v-on:refreshTable="refreshTable" />
  </div>
</template>

<script>
import { loadUserPreferencesForBootstrapTable } from '@/shared/utils';
import { Switch as cSwitch } from '@coreui/vue';
import MurmurHash2 from 'imurmurhash';
import Vue from 'vue';
import xssFilters from 'xss-filters';
import permissionsMixin from '../../../mixins/permissionsMixin';
import routerMixin from '../../../mixins/routerMixin';
import common from '../../../shared/common';
import PolicyViolationProgressBar from '../../components/PolicyViolationProgressBar';
import SeverityProgressBar from '../../components/SeverityProgressBar';
import PortfolioWidgetRow from '../../dashboard/PortfolioWidgetRow';
import ProjectCreateProjectModal from './ProjectCreateProjectModal';

export default {
  mixins: [permissionsMixin, routerMixin],
  components: {
    cSwitch,
    ProjectCreateProjectModal,
    PortfolioWidgetRow,
  },
  props: {
    parentProject: Object,
    uuid: String,
  },
  beforeCreate() {
    this.showInactiveProjects =
      localStorage &&
      localStorage.getItem('ProjectListShowInactiveProjects') !== null
        ? localStorage.getItem('ProjectListShowInactiveProjects') === 'true'
        : false;

    this.showFlatView =
      localStorage &&
      localStorage.getItem('ProjectListShowFlatView') !== null
        ? localStorage.getItem('ProjectListShowFlatView') === 'true'
        : false;
  },
  methods: {
    initializeProjectCreateProjectModal() {
      this.$root.$emit('initializeProjectCreateProjectModal');
    },
    apiUrl(uuid) {
      if (this.uuid && !uuid) {
        uuid = this.uuid;
      }

      let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`;

      if (uuid) {
        url += `/${uuid}/children`;
      }

      if (this.showInactiveProjects === undefined) {
        url += '?excludeInactive=true';
      } else {
        url += '?excludeInactive=' + !this.showInactiveProjects;
      }

      return url;
    },
    refreshTable() {
      this.$refs.table.refresh({
        url: this.apiUrl(),
        silent: true,
        pageNumber: 1,
      });
    },
    onLoadSuccess() {
      loadUserPreferencesForBootstrapTable(
        this,
        'ProjectList',
        this.$refs.table.columns
      );
    },
    onPreBody() {
      this.$refs.table.getData().forEach((project) => {
        project.id = MurmurHash2(project.uuid).result();
      });
    },
    onPostBody() {
      this.$refs.table.hideLoading();
    },
    saveViewState() {
      this.savedViewState = this.showFlatView;
    },
  },
  watch: {
    showInactiveProjects() {
      if (localStorage) {
        localStorage.setItem(
          'ProjectListShowInactiveProjects',
          this.showInactiveProjects.toString()
        );
      }
      this.refreshTable();
    },
    showFlatView() {
      if (localStorage) {
        localStorage.setItem(
          'ProjectListShowFlatView',
          this.showFlatView.toString()
        );
      }
      this.refreshTable();
    },
  },
  data() {
    return {
      showInactiveProjects: this.showInactiveProjects,
      showFlatView: this.showFlatView,
      isSearching: false,
      savedViewState: null,
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      data: [],
      columns: [],
      options: {
        url: this.apiUrl(),
      },
    };
  },
};
</script>
