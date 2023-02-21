<template>
  <b-modal id="projectDetailsModal" size="lg" hide-header-close no-stacking :title="$t('message.project_details')" @show="initializeTags" @hide="resetValues()">
    <b-tabs class="body-bg-color" style="border:0;padding:0">
      <b-tab class="body-bg-color" style="border:0;padding:0" active>
        <template v-slot:title><i class="fa fa-edit"></i> {{ $t('message.general') }}</template>
        <b-card>
          <b-input-group-form-input id="project-name-input" input-group-size="mb-3" type="text" v-model="project.name"
                                    lazy="true" required="true" feedback="true" autofocus="false"
                                    :label="$t('message.project_name')" :tooltip="this.$t('message.project_name_desc')"
                                    :feedback-text="$t('message.required_project_name')" v-on:change="syncReadOnlyNameField"
                                    :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)" />
          <b-input-group-form-input id="project-version-input" input-group-size="mb-3" type="text" v-model="project.version"
                                    lazy="true" required="false" feedback="false" autofocus="false" v-on:change="syncReadOnlyVersionField"
                                    :label="$t('message.version')" :tooltip="this.$t('message.component_version_desc')"
                                    :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)" />
          <b-input-group-form-select id="v-classifier-input" required="true"
                                     v-model="project.classifier" :options="availableClassifiers"
                                     :label="$t('message.classifier')" :tooltip="$t('message.component_classifier_desc')"
                                     :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)" />
          <div style="margin-bottom: 1rem">
            <label>Parent</label>
            <multiselect v-model="selectedParent" id="multiselect" :custom-label="createProjectLabel" :placeholder="this.$t('message.search_parent')" open-direction="bottom" :options="availableParents"
                         :multiple="false" :searchable="true" track-by="uuid" :loading="isLoading" @search-change="asyncFind" :internal-search="false" :close-on-select="true"
                         selectLabel="" deselectLabel="" ></multiselect>
          </div>
          <b-form-group
            id="project-description-form-group"
            :label="this.$t('message.description')"
            label-for="project-description-input">
            <b-form-textarea id="project-description-description" v-model="project.description" rows="3"
                             :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)" />
          </b-form-group>
          <b-form-group
            id="project-classifier-form-group"
            :label="this.$t('message.tags')"
            label-for="input-4">
            <vue-tags-input id="input-4" v-model="tag" :tags="tags" :add-on-key="addOnKeys"
                            :placeholder="$t('message.add_tag')" @tags-changed="newTags => this.tags = newTags"
                            style="max-width:none; background-color:transparent;"
                            :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)" />
          </b-form-group>
          <c-switch id="input-5" class="mx-1" color="primary" v-model="project.active" label
                    :disabled="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT) || (project.active && this.hasActiveChild(project))" v-bind="labelIcon"
                    v-b-tooltip.hover :title="$t('message.inactive_active_children')"/> {{$t('message.active')}}
          <p></p>
          <b-input-group-form-input id="project-uuid" input-group-size="mb-3" type="text" v-model="project.uuid"
                                    lazy="false" required="false" feedback="false" autofocus="false" disabled="true"
                                    :label="$t('message.object_identifier')" :tooltip="this.$t('message.object_identifier_desc')"
                                    :readonly="true" />
        </b-card>
      </b-tab>
      <b-tab class="body-bg-color" style="border:0;padding:0">
        <template v-slot:title><i class="fa fa-cube"></i> {{ $t('message.identity') }}</template>
        <b-card>
          <b-input-group-form-input id="project-name-input-identify" input-group-size="mb-3" type="text" v-model="readOnlyProjectName"
                                    lazy="true" required="false" feedback="true" autofocus="false" disabled="true"
                                    :label="$t('message.project_name')" :tooltip="this.$t('message.project_name_desc')"
                                    :readonly="true" />
          <b-input-group-form-input id="project-version-input-identify" input-group-size="mb-3" type="text" v-model="readOnlyProjectVersion"
                                    lazy="true" required="false" feedback="true" autofocus="false" disabled="true"
                                    :label="$t('message.version')" :tooltip="this.$t('message.component_version_desc')"
                                    :readonly="true" />
          <b-input-group-form-input id="project-group-input" input-group-size="mb-3" type="text" v-model="project.group"
                                    required="false" :label="$t('message.component_namespace_group_vendor')"
                                    :tooltip="this.$t('message.component_group_desc')"
                                    :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)" />
          <b-input-group-form-input id="project-purl-input" input-group-size="mb-3" type="text" v-model="project.purl"
                                    required="false" :label="$t('message.package_url_full')"
                                    :tooltip="this.$t('message.component_package_url_desc')"
                                    :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)" />
          <b-input-group-form-input id="project-cpe-input" input-group-size="mb-3" type="text" v-model="project.cpe"
                                    required="false" :label="$t('message.cpe_full')"
                                    :tooltip="$t('message.component_cpe_desc')"
                                    :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)" />
          <b-input-group-form-input id="project-swidTagId-input" input-group-size="mb-3" type="text" v-model="project.swidTagId"
                                    required="false" :label="$t('message.swid_tagid')"
                                    :tooltip="$t('message.component_swid_tagid_desc')"
                                    :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)" />
        </b-card>
      </b-tab>
      <b-tab>
        <template v-slot:title><i class="fa fa-external-link"></i> {{ $t('message.external_references') }}</template>
        <b-card>
          <bootstrap-table
            ref="referencesTable"
            :columns="referencesTableColumns"
            :data="project.externalReferences"
            :options="referencesTableOptions">
          </bootstrap-table>
        </b-card>
      </b-tab>
    </b-tabs>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="outline-danger" @click="deleteProject()" v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT">{{ $t('message.delete') }}</b-button>
      <b-button size="md" variant="outline-primary" v-b-modal.projectPropertiesModal v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT">{{ $t('message.properties') }}</b-button>
      <b-button size="md" variant="outline-primary" v-b-modal.projectAddVersionModal v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT">{{ $t('message.add_version') }}</b-button>
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.close') }}</b-button>
      <b-button size="md" variant="primary" @click="updateProject()" v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT">{{ $t('message.update') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import BInputGroupFormInput from "../../../forms/BInputGroupFormInput";
  import BInputGroupFormSelect from "../../../forms/BInputGroupFormSelect";
  import VueTagsInput from '@johmun/vue-tags-input';
  import { Switch as cSwitch } from '@coreui/vue';
  import permissionsMixin from "../../../mixins/permissionsMixin";
  import common from "../../../shared/common";
  import Multiselect from "vue-multiselect"
  import xssFilters from "xss-filters";

  export default {
    name: "ProjectDetailsModal",
    mixins: [permissionsMixin],
    components: {
      BInputGroupFormInput,
      BInputGroupFormSelect,
      VueTagsInput,
      cSwitch,
      Multiselect
    },
    props: {
      project: Object,
      uuid: String
    },
    data() {
      return {
        readOnlyProjectName: '',
        readOnlyProjectVersion: '',
        availableClassifiers: [
          { value: 'APPLICATION', text: this.$i18n.t('message.component_application') },
          { value: 'FRAMEWORK', text: this.$i18n.t('message.component_framework') },
          { value: 'LIBRARY', text: this.$i18n.t('message.component_library') },
          { value: 'CONTAINER', text: this.$i18n.t('message.component_container') },
          { value: 'OPERATING_SYSTEM', text: this.$i18n.t('message.component_operating_system') },
          { value: 'DEVICE', text: this.$i18n.t('message.component_device') },
          { value: 'FIRMWARE', text: this.$i18n.t('message.component_firmware') },
          { value: 'FILE', text: this.$i18n.t('message.component_file') }
        ],
        parent: null,
        selectedParent: null,
        availableParents: [],
        tag: '', // The contents of a tag as its being typed into the vue-tag-input
        tags: [], // An array of tags bound to the vue-tag-input
        addOnKeys: [9, 13, 32, ':', ';', ','], // Separators used when typing tags into the vue-tag-input
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        },
        isLoading: false,
        referencesTableColumns: [
          {
            title: this.$t('message.url'),
            field: "url",
            sortable: false,
            formatter(value, row, index) {
              let url = xssFilters.uriInUnQuotedAttr(common.valueWithDefault(value, ""));
              return `<a href="${url}">${xssFilters.inHTMLData(common.valueWithDefault(value, ""))}</a>`;
            }
          },
          {
            title: this.$t('message.type'),
            field: "type",
            sortable: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          }
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
            refresh: 'fa-refresh'
          },
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          }
        }
      }
    },
    beforeUpdate() {
      this.readOnlyProjectName = this.project.name;
      this.readOnlyProjectVersion = this.project.version;
    },
    beforeMount() {
      this.$root.$on('initializeProjectDetailsModal', async () => {
        if (!this.retrievedParents && this.project.parent) {
          this.parent = (await this.axios.get(`${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/${this.project.parent.uuid}`)).data
          this.selectedParent = this.parent
          this.availableParents = this.parent ? [this.parent] : []
          this.retrievedParents = true
        }
        this.$root.$emit("bv::show::modal", "projectDetailsModal")
      })
    },
    methods: {
      initializeTags: function() {
        this.tags = (this.project.tags || []).map(tag => ({ text: tag.name }));
      },
      syncReadOnlyNameField: function(value) {
        this.readOnlyProjectName = value;
      },
      syncReadOnlyVersionField: function(value) {
        this.readOnlyProjectVersion = value;
      },
      updateProject: function() {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`;
        let tagsNode = [];
        let parent = null
        if (this.selectedParent){
          parent = {uuid: this.selectedParent.uuid};
        }
        this.tags.forEach((tag) => tagsNode.push({name: tag.text}));
        this.axios.post(url, {
          uuid: this.project.uuid,
          author: this.project.author,
          publisher: this.project.publisher,
          group: this.project.group,
          name: this.project.name,
          version: this.project.version,
          description: this.project.description,
          classifier: this.project.classifier,
          parent: parent,
          cpe: this.project.cpe,
          purl: this.project.purl,
          swidTagId: this.project.swidTagId,
          tags: tagsNode,
          active: this.project.active
        }).then((response) => {
          this.$emit('projectUpdated', response.data);
          this.$toastr.s(this.$t('message.project_updated'));
          this.parent = this.selectedParent
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        }).finally(() => {
          this.$root.$emit('bv::hide::modal', 'projectDetailsModal');
        });
      },
      deleteProject: function() {
        this.$root.$emit('bv::hide::modal', 'projectDetailsModal');
        let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/` + this.project.uuid;
        this.axios.delete(url).then((response) => {
          this.$toastr.s(this.$t('message.project_deleted'));
          this.$router.replace({ name: "Projects" });
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      },
      hasActiveChild: function (project) {
        return project.children && project.children.some((child) => {
          return child.active || this.hasActiveChild(child);
        });
      },
      createProjectLabel: function (project) {
        if (project.version){
          return project.name + " : " + project.version
        } else {
          return project.name
        }
      },
      asyncFind: function (query) {
        if (query) {
          this.isLoading = true
          let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/withoutDescendantsOf/${this.uuid}?searchText=${query}&excludeInactive=true`
          this.axios.get(url).then(response => {
            if (response.data) {
              this.availableParents = response.data
            } else {
              this.availableParents = this.parent ? [this.parent] : []
            }
            this.isLoading = false
          })
        }
      },
      resetValues: function () {
        this.selectedParent = this.parent
        this.availableParents = this.parent ? [this.parent] : []
      }
    }
  }
</script>

<style lang="scss">
  @import "../../../assets/scss/vendors/vue-tags-input/vue-tags-input";
</style>

<style scoped>
.tab-content .tab-pane{
  padding: 0 !important;
}
.tab-content {
  border: 0 !important;
}
.card {
  border:0;
  padding:0;
  margin-bottom:0;
}
</style>
