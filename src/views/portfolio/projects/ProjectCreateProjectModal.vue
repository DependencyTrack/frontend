<template>
  <b-modal id="projectCreateProjectModal" @hide="resetValues()" size="md" hide-header-close no-stacking :title="$t('message.create_project')">
    <b-tabs class="body-bg-color" style="border:0;padding:0">
      <b-tab class="body-bg-color" style="border:0;padding:0" active>
        <template v-slot:title><i class="fa fa-edit"></i> {{ $t('message.general') }}</template>
        <b-card>
          <b-input-group-form-input id="project-name-input" input-group-size="mb-3" type="text" v-model="project.name"
                                    lazy="true" required="true" feedback="true" autofocus="false"
                                    :label="$t('message.project_name')" :tooltip="this.$t('message.project_name_desc')"
                                    :feedback-text="$t('message.required_project_name')" />
          <b-input-group-form-input id="project-version-input" input-group-size="mb-3" type="text" v-model="project.version"
                                    lazy="true" required="false" feedback="false" autofocus="false"
                                    :label="$t('message.version')" :tooltip="this.$t('message.component_version_desc')"/>
          <b-input-group-form-select id="v-classifier-input" required="true"
                                     v-model="project.classifier" :options="sortAvailableClassifiers"
                                     :label="$t('message.classifier')" :tooltip="$t('message.component_classifier_desc')" />
          <b-form-group
            id="project-description-form-group"
            :label="this.$t('message.description')"
            label-for="project-description-input">
            <b-form-textarea id="project-description-description" v-model="project.description" rows="3" />
          </b-form-group>
          <b-form-group
            id="project-classifier-form-group"
            :label="this.$t('message.tags')"
            label-for="input-4">
            <vue-tags-input id="input-4" v-model="tag" :tags="tags" :add-on-key="addOnKeys"
                            :placeholder="$t('message.add_tag')" @tags-changed="newTags => this.tags = newTags"
                            style="max-width:none; background-color:transparent;"/>
          </b-form-group>
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
                                    :tooltip="this.$t('message.component_group_desc')" />
          <b-input-group-form-input id="project-purl-input" input-group-size="mb-3" type="text" v-model="project.purl"
                                    required="false" :label="$t('message.package_url_full')"
                                    :tooltip="this.$t('message.component_package_url_desc')" />
          <b-input-group-form-input id="project-cpe-input" input-group-size="mb-3" type="text" v-model="project.cpe"
                                    required="false" :label="$t('message.cpe_full')"
                                    :tooltip="$t('message.component_cpe_desc')" />
          <b-input-group-form-input id="project-swidTagId-input" input-group-size="mb-3" type="text" v-model="project.swidTagId"
                                    required="false" :label="$t('message.swid_tagid')"
                                    :tooltip="$t('message.component_swid_tagid_desc')" />
        </b-card>
      </b-tab>
      <!--
      <b-tab>
        <template v-slot:title><i class="fa fa-balance-scale"></i> {{ $t('message.legal') }}</template>
        <b-card>
          <b-input-group-form-select id="project-license-input" required="false"
                                     v-model="selectedLicense" :options="selectableLicenses"
                                     :label="$t('message.license')" :tooltip="$t('message.component_spdx_license_desc')" />
          <b-form-group
            id="project-copyright-form-group"
            :label="this.$t('message.copyright')"
            label-for="project-copyright-input">
            <b-form-textarea id="project-description-description" v-model="project.copyright" rows="3" />
          </b-form-group>
        </b-card>
      </b-tab>
      -->
    </b-tabs>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.close') }}</b-button>
      <b-button size="md" variant="primary" @click="createProject()">{{ $t('message.create') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import BInputGroupFormInput from "../../../forms/BInputGroupFormInput";
  import BInputGroupFormSelect from "../../../forms/BInputGroupFormSelect";
  import VueTagsInput from '@johmun/vue-tags-input';
  import { Switch as cSwitch } from '@coreui/vue';
  import permissionsMixin from "../../../mixins/permissionsMixin";

  export default {
    name: "ProjectCreateProjectModal",
    mixins: [permissionsMixin],
    components: {
      BInputGroupFormInput,
      BInputGroupFormSelect,
      VueTagsInput,
      cSwitch
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
        selectableLicenses: [],
        selectedLicense: '',
        project: {},
        tag: '', // The contents of a tag as its being typed into the vue-tag-input
        tags: [], // An array of tags bound to the vue-tag-input
        addOnKeys: [9, 13, 32, ':', ';', ','], // Separators used when typing tags into the vue-tag-input
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        },
      }
    },
    beforeUpdate() {
      if (this.tags.length === 0 && this.project && this.project.tags)  { // Prevents line from being executed when entering new tags
        this.project.tags.forEach((tag) => this.tags.push({text: tag.name}));
      }
      this.readOnlyProjectName = this.project.name;
      this.readOnlyProjectVersion = this.project.version;
    },
    beforeMount() {
      this.retrieveLicenses();
    },
    computed: {
      sortAvailableClassifiers: function() {
        this.availableClassifiers.sort(function(a, b) {
          return a.text.localeCompare(b.text);
        });
        return this.availableClassifiers;
      }
    },
    methods: {
      syncReadOnlyNameField: function(value) {
        this.readOnlyProjectName = value;
      },
      syncReadOnlyVersionField: function(value) {
        this.readOnlyProjectVersion = value;
      },
      createProject: function() {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`;
        let tagsNode = [];
        this.tags.forEach((tag) => tagsNode.push({name: tag.text}));
        this.axios.put(url, {
          name: this.project.name,
          version: this.project.version,
          group: this.project.group,
          description: this.project.description,
          //license: this.selectedLicense,
          classifier: this.project.classifier,
          purl: this.project.purl,
          cpe: this.project.cpe,
          swidTagId: this.project.swidTagId,
          copyright: this.project.copyright,
          tags: tagsNode,
          active: true
        }).then((response) => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('message.project_created'));
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        }).finally(() => {
          this.$root.$emit('bv::hide::modal', 'projectCreateProjectModal');
        });
      },
      retrieveLicenses: function() {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_CONCISE}`;
        this.axios.get(url).then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            let license = response.data[i];
            this.selectableLicenses.push({value: license.licenseId, text: license.name});
            if (this.project.resolvedLicense && this.project.resolvedLicense.uuid === license.uuid ) {
              this.selectedLicense = license.licenseId;
            }
          }
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      },
      resetValues: function () {
        this.project = {};
        this.tag = "";
        this.tags = [];
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
