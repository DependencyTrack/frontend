<template>
  <b-modal
    id="projectDetailsModal"
    size="lg"
    hide-header-close
    no-stacking
    :title="$t('message.project_details')"
    @show="initializeTags"
    @hide="resetValues()"
  >
    <b-tabs class="body-bg-color" style="border: 0; padding: 0">
      <b-tab class="body-bg-color" style="border: 0; padding: 0" active>
        <template v-slot:title
          ><i class="fa fa-edit"></i> {{ $t('message.general') }}</template
        >
        <b-card>
          <b-input-group-form-input
            id="project-name-input"
            input-group-size="mb-3"
            type="text"
            v-model="project.name"
            lazy="true"
            required="true"
            feedback="true"
            autofocus="false"
            :label="$t('message.project_name')"
            :tooltip="this.$t('message.project_name_desc')"
            :feedback-text="$t('message.required_project_name')"
            v-on:change="syncReadOnlyNameField"
            :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
          />
          <b-row align-v="stretch">
            <b-col>
              <b-input-group-form-input
                id="project-version-input"
                input-group-size="mb-3"
                type="text"
                v-model="project.version"
                lazy="true"
                required="false"
                feedback="false"
                autofocus="false"
                v-on:change="syncReadOnlyVersionField"
                :label="$t('message.version')"
                :tooltip="this.$t('message.component_version_desc')"
                :readonly="
                  this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)
                "
              />
            </b-col>
            <b-col cols="auto">
              <b-input-group-form-switch
                id="project-details-islatest"
                :label="$t('message.project_is_latest')"
                v-model="project.isLatest"
                :show-placeholder-label="true"
                :readonly="
                  this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)
                "
              />
            </b-col>
          </b-row>
          <b-input-group-form-select
            id="v-classifier-input"
            required="true"
            v-model="project.classifier"
            :options="availableClassifiers"
            :label="$t('message.classifier')"
            :tooltip="$t('message.component_classifier_desc')"
            :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
          />
          <b-input-group-form-select
            id="v-collection-logic-input"
            required="true"
            v-model="project.collectionLogic"
            :options="availableCollectionLogics"
            :label="$t('message.collectionLogic')"
            :tooltip="$t('message.project_collection_logic_desc')"
            :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
            v-on:change="syncCollectionTagsVisibility"
          />
          <vue-tags-input
            id="input-collectionTags"
            v-model="collectionTagTyping"
            :tags="collectionTags"
            :add-on-key="addOnKeys"
            :placeholder="$t('message.project_add_collection_tag')"
            @tags-changed="newCollectionTags => this.collectionTags = newCollectionTags"
            class="mw-100 bg-transparent text-lowercase"
            :max-tags="1"
            v-show="showCollectionTags"
            :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
          />
          <div style="margin-bottom: 1rem">
            <label>Parent</label>
            <multiselect
              v-model="selectedParent"
              id="multiselect"
              :custom-label="createProjectLabel"
              :placeholder="this.$t('message.search_parent')"
              open-direction="bottom"
              :options="availableParents"
              :multiple="false"
              :searchable="true"
              track-by="uuid"
              :loading="isLoading"
              @search-change="asyncFind"
              :internal-search="false"
              :close-on-select="true"
              selectLabel=""
              deselectLabel=""
            ></multiselect>
          </div>
          <b-form-group
            id="project-description-form-group"
            :label="this.$t('message.description')"
            label-for="project-description-input"
          >
            <b-form-textarea
              id="project-description-description"
              v-model="project.description"
              rows="3"
              :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
            />
          </b-form-group>
          <b-form-group
            id="project-classifier-form-group"
            :label="this.$t('message.tags')"
            label-for="input-4"
          >
            <vue-tags-input
              id="input-4"
              v-model="tag"
              :tags="tags"
              :add-on-key="addOnKeys"
              :placeholder="$t('message.add_tag')"
              :autocomplete-items="tagsAutoCompleteItems"
              @tags-changed="(newTags) => (this.tags = newTags)"
              class="mw-100 bg-transparent text-lowercase"
              :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
            />
          </b-form-group>
          <b-input-group-form-switch
            id="project-details-active"
            :label-on="$t('message.active')"
            :label-off="$t('message.inactive')"
            v-model="project.active"
            :tooltip="$t('message.inactive_active_children')"
            :disabled="
              this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT) ||
              (project.active && this.hasActiveChild(project))
            "
          />
          <p></p>
          <b-input-group-form-input
            id="project-uuid"
            input-group-size="mb-3"
            type="text"
            v-model="project.uuid"
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
      <b-tab class="body-bg-color" style="border: 0; padding: 0">
        <template v-slot:title
          ><i class="fa fa-cube"></i> {{ $t('message.identity') }}</template
        >
        <b-card>
          <b-input-group-form-input
            id="project-name-input-identify"
            input-group-size="mb-3"
            type="text"
            v-model="readOnlyProjectName"
            lazy="true"
            required="false"
            feedback="true"
            autofocus="false"
            disabled="true"
            :label="$t('message.project_name')"
            :tooltip="this.$t('message.project_name_desc')"
            :readonly="true"
          />
          <b-input-group-form-input
            id="project-version-input-identify"
            input-group-size="mb-3"
            type="text"
            v-model="readOnlyProjectVersion"
            lazy="true"
            required="false"
            feedback="true"
            autofocus="false"
            disabled="true"
            :label="$t('message.version')"
            :tooltip="this.$t('message.component_version_desc')"
            :readonly="true"
          />
          <b-input-group-form-input
            id="project-group-input"
            input-group-size="mb-3"
            type="text"
            v-model="project.group"
            required="false"
            :label="$t('message.component_namespace_group_vendor')"
            :tooltip="this.$t('message.component_group_desc')"
            :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
          />
          <b-input-group-form-input
            id="project-purl-input"
            input-group-size="mb-3"
            type="text"
            v-model="project.purl"
            required="false"
            :label="$t('message.package_url_full')"
            :tooltip="this.$t('message.component_package_url_desc')"
            :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
          />
          <b-input-group-form-input
            id="project-cpe-input"
            input-group-size="mb-3"
            type="text"
            v-model="project.cpe"
            required="false"
            :label="$t('message.cpe_full')"
            :tooltip="$t('message.component_cpe_desc')"
            :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
          />
          <b-input-group-form-input
            id="project-swidTagId-input"
            input-group-size="mb-3"
            type="text"
            v-model="project.swidTagId"
            required="false"
            :label="$t('message.swid_tagid')"
            :tooltip="$t('message.component_swid_tagid_desc')"
            :readonly="this.isNotPermitted(PERMISSIONS.PORTFOLIO_MANAGEMENT)"
          />
        </b-card>
      </b-tab>
      <b-tab
        class="body-bg-color"
        style="border: 0; padding: 0"
        v-if="project.manufacturer"
      >
        <template v-slot:title
          ><i class="fa fa-industry"></i>
          {{ $t('message.manufacturer') }}</template
        >
        <b-card>
          <b-input-group-form-input
            id="project-manufacturer-name-input"
            input-group-size="mb-3"
            type="text"
            v-model="project.manufacturer.name"
            required="false"
            readonly
            :label="$t('message.manufacturer_name')"
            disabled="true"
            :tooltip="this.$t('message.manufacturer_name_desc')"
          />
          <b-form-group
            id="manufacturerUrlsTable-Fieldset"
            :label="this.$t('message.urls')"
            label-for="manufacturerUrlsTable"
          >
            <bootstrap-table
              id="manufacturerUrlsTable"
              ref="manufacturerUrlsTable"
              :columns="urlsTableColumns"
              :data="project.manufacturer.urls"
              :options="urlsTableOptions"
            >
            </bootstrap-table>
          </b-form-group>
          <b-form-group
            id="manufacturerContactsTable-Fieldset"
            :label="this.$t('message.contacts')"
            label-for="contactsTable"
          >
            <bootstrap-table
              id="manufacturerContactsTable"
              ref="manufacturerContactsTable"
              :columns="contactsTableColumns"
              :data="project.manufacturer.contacts"
              :options="contactsTableOptions"
            >
            </bootstrap-table>
          </b-form-group>
        </b-card>
      </b-tab>
      <b-tab
        class="body-bg-color"
        style="border: 0; padding: 0"
        v-if="project.supplier"
      >
        <template v-slot:title
          ><i class="fa fa-building-o"></i>
          {{ $t('message.supplier') }}</template
        >
        <b-card>
          <b-input-group-form-input
            id="project-supplier-name-input"
            input-group-size="mb-3"
            type="text"
            v-model="project.supplier.name"
            required="false"
            readonly
            :label="$t('message.supplier_name')"
            disabled="true"
            :tooltip="this.$t('message.project_supplier_name_desc')"
          />
          <b-form-group
            id="supplierUrlsTable-Fieldset"
            :label="this.$t('message.urls')"
            label-for="supplierUrlsTable"
          >
            <bootstrap-table
              id="supplierUrlsTable"
              ref="supplierUrlsTable"
              :columns="urlsTableColumns"
              :data="project.supplier.urls"
              :options="urlsTableOptions"
            >
            </bootstrap-table>
          </b-form-group>
          <b-form-group
            id="supplierContactsTable-Fieldset"
            :label="this.$t('message.contacts')"
            label-for="contactsTable"
          >
            <bootstrap-table
              id="supplierContactsTable"
              ref="supplierContactsTable"
              :columns="contactsTableColumns"
              :data="project.supplier.contacts"
              :options="contactsTableOptions"
            >
            </bootstrap-table>
          </b-form-group>
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
            :data="project.externalReferences"
            :options="referencesTableOptions"
          >
          </bootstrap-table>
        </b-card>
      </b-tab>
      <b-tab
        style="border: 0; padding: 0"
        v-if="
          project.metadata &&
          (project.metadata.authors || project.metadata.supplier)
        "
      >
        <template v-slot:title
          ><i class="fa fa-file-text-o"></i> {{ $t('message.bom') }}</template
        >
        <b-card>
          <b-tabs pills card vertical>
            <b-tab
              :title="$t('message.authors')"
              v-if="project.metadata.authors"
            >
              <b-card>
                <b-form-group id="authorsTable-Fieldset">
                  <bootstrap-table
                    id="authorsTable"
                    ref="authorsTable"
                    :columns="contactsTableColumns"
                    :data="project.metadata.authors"
                    :options="contactsTableOptions"
                  >
                  </bootstrap-table>
                </b-form-group>
              </b-card>
            </b-tab>
            <b-tab
              :title="$t('message.supplier')"
              v-if="project.metadata.supplier"
            >
              <b-card>
                <b-input-group-form-input
                  id="project-metadata-supplier-name-input"
                  input-group-size="mb-3"
                  type="text"
                  v-model="project.metadata.supplier.name"
                  required="false"
                  readonly
                  :label="$t('message.supplier_name')"
                  disabled="true"
                  :tooltip="
                    this.$t('message.project_metadata_supplier_name_desc')
                  "
                />
                <b-form-group
                  id="supplierUrlsTable-Fieldset"
                  :label="this.$t('message.urls')"
                  label-for="supplierUrlsTable"
                >
                  <bootstrap-table
                    id="supplierUrlsTable"
                    ref="supplierUrlsTable"
                    :columns="urlsTableColumns"
                    :data="project.metadata.supplier.urls"
                    :options="urlsTableOptions"
                  >
                  </bootstrap-table>
                </b-form-group>
                <b-form-group
                  id="supplierContactsTable-Fieldset"
                  :label="this.$t('message.contacts')"
                  label-for="contactsTable"
                >
                  <bootstrap-table
                    id="supplierContactsTable"
                    ref="supplierContactsTable"
                    :columns="contactsTableColumns"
                    :data="project.metadata.supplier.contacts"
                    :options="contactsTableOptions"
                  >
                  </bootstrap-table>
                </b-form-group>
              </b-card>
            </b-tab>
          </b-tabs>
        </b-card>
      </b-tab>
    </b-tabs>
    <template v-slot:modal-footer="{ cancel }">
      <b-button
        size="md"
        variant="outline-danger"
        @click="deleteProject()"
        v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT"
        >{{ $t('message.delete') }}</b-button
      >
      <b-button
        size="md"
        variant="outline-primary"
        v-b-modal.projectPropertiesModal
        v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT"
        >{{ $t('message.properties') }}</b-button
      >
      <b-button
        size="md"
        variant="outline-primary"
        v-b-modal.projectAddVersionModal
        v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT"
        >{{ $t('message.add_version') }}</b-button
      >
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button
        size="md"
        variant="primary"
        @click="updateProject()"
        v-permission="PERMISSIONS.PORTFOLIO_MANAGEMENT"
        >{{ $t('message.update') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import BInputGroupFormInput from '../../../forms/BInputGroupFormInput';
import BInputGroupFormSelect from '../../../forms/BInputGroupFormSelect';
import VueTagsInput from '@johmun/vue-tags-input';
import { Switch as cSwitch } from '@coreui/vue';
import permissionsMixin from '../../../mixins/permissionsMixin';
import common from '../../../shared/common';
import Multiselect from 'vue-multiselect';
import xssFilters from 'xss-filters';
import BInputGroupFormSwitch from '@/forms/BInputGroupFormSwitch.vue';

export default {
  name: 'ProjectDetailsModal',
  mixins: [permissionsMixin],
  components: {
    BInputGroupFormSwitch,
    BInputGroupFormInput,
    BInputGroupFormSelect,
    VueTagsInput,
    cSwitch,
    Multiselect,
  },
  props: {
    project: Object,
    uuid: String,
  },
  data() {
    return {
      readOnlyProjectName: '',
      readOnlyProjectVersion: '',
      availableClassifiers: [
        {
          value: 'APPLICATION',
          text: this.$i18n.t('message.component_application'),
        },
        {
          value: 'FRAMEWORK',
          text: this.$i18n.t('message.component_framework'),
        },
        { value: 'LIBRARY', text: this.$i18n.t('message.component_library') },
        {
          value: 'CONTAINER',
          text: this.$i18n.t('message.component_container'),
        },
        {
          value: 'OPERATING_SYSTEM',
          text: this.$i18n.t('message.component_operating_system'),
        },
        { value: 'DEVICE', text: this.$i18n.t('message.component_device') },
        { value: 'FIRMWARE', text: this.$i18n.t('message.component_firmware') },
        { value: 'FILE', text: this.$i18n.t('message.component_file') },
      ],
      availableCollectionLogics: [
        { value: 'NONE', text: this.$i18n.t('message.project_collection_logic_none') },
        { value: 'AGGREGATE_DIRECT_CHILDREN', text: this.$i18n.t('message.project_collection_logic_aggregate_direct_children') },
        { value: 'AGGREGATE_DIRECT_CHILDREN_WITH_TAG', text: this.$i18n.t('message.project_collection_logic_aggregate_direct_children_with_tag') },
        { value: 'HIGHEST_SEMVER_CHILD', text: this.$i18n.t('message.project_collection_logic_highest_semver_child') }
      ],
      parent: null,
      selectedParent: null,
      availableParents: [],
      tag: '', // The contents of a tag as its being typed into the vue-tag-input
      tags: [], // An array of tags bound to the vue-tag-input
      tagsAutoCompleteItems: [],
      tagsAutoCompleteDebounce: null,
      collectionTagTyping: '', // The contents of a collection tag as its being typed into the vue-tag-input
      collectionTags: [], // An array of tags bound to the vue-tag-input for collection tag
      showCollectionTags: false,
      addOnKeys: [9, 13, 32, ':', ';', ','], // Separators used when typing tags into the vue-tag-input
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      isLoading: false,
      urlsTableColumns: [
        {
          title: this.$t('message.urls'),
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(row, ''));
          },
        },
      ],
      urlsTableOptions: {
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
  beforeUpdate() {
    this.readOnlyProjectName = this.project.name;
    this.readOnlyProjectVersion = this.project.version;
  },
  beforeMount() {
    this.$root.$on('initializeProjectDetailsModal', async () => {
      if (!this.retrievedParents && this.project.parent) {
        this.parent = (
          await this.axios.get(
            `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/${this.project.parent.uuid}`,
          )
        ).data;
        this.selectedParent = this.parent;
        this.availableParents = [{ name: '', version: '', uuid: null }];
        this.retrievedParents = true;
      }
      this.$root.$emit('bv::show::modal', 'projectDetailsModal');
    });
  },
  watch: {
    tag: 'searchTags',
  },
  methods: {
    initializeTags: function () {
      this.tags = (this.project.tags || []).map((tag) => ({ text: tag.name }));
      this.collectionTags = this.project.collectionTag ? [{ text: this.project.collectionTag.name }] : [];
      this.syncCollectionTagsVisibility(this.project.collectionLogic);
    },
    syncReadOnlyNameField: function (value) {
      this.readOnlyProjectName = value;
    },
    syncReadOnlyVersionField: function (value) {
      this.readOnlyProjectVersion = value;
    },
    syncCollectionTagsVisibility: function(value) {
      this.showCollectionTags = value === 'AGGREGATE_DIRECT_CHILDREN_WITH_TAG';
    },
    updateProject: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`;
      let tagsNode = [];
      let parent = null;
      if (this.selectedParent) {
        parent = { uuid: this.selectedParent.uuid };
      }
      this.tags.forEach((tag) => tagsNode.push({ name: tag.text }));
      this.axios
        .post(url, {
          uuid: this.project.uuid,
          author: this.project.author,
          publisher: this.project.publisher,
          supplier: this.project.supplier,
          group: this.project.group,
          name: this.project.name,
          version: this.project.version,
          description: this.project.description,
          classifier: this.project.classifier,
          collectionLogic: this.project.collectionLogic,
          collectionTag: ( this.project.collectionLogic === 'AGGREGATE_DIRECT_CHILDREN_WITH_TAG' &&
                          this.collectionTags &&
                          this.collectionTags.length > 0 ) ? {name: this.collectionTags[0].text} : null,
          parent: parent,
          cpe: this.project.cpe,
          purl: this.project.purl,
          swidTagId: this.project.swidTagId,
          tags: tagsNode,
          active: this.project.active,
          isLatest: this.project.isLatest,
          externalReferences: this.project.externalReferences,
        })
        .then((response) => {
          this.$emit('projectUpdated', response.data);
          this.$toastr.s(this.$t('message.project_updated'));
          this.parent = this.selectedParent;
        })
        .catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        })
        .finally(() => {
          this.$root.$emit('bv::hide::modal', 'projectDetailsModal');
        });
    },
    deleteProject: async function () {
      this.$root.$emit('bv::hide::modal', 'projectDetailsModal');
      let confirmed = await this.$bvModal.msgBoxConfirm(
        this.$t('message.project_delete_message'),
        {
          title: this.$t('message.project_delete_title'),
        },
      );
      if (confirmed) {
        let url =
          `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/` + this.project.uuid;
        this.axios
          .delete(url)
          .then((response) => {
            this.$toastr.s(this.$t('message.project_deleted'));
            this.$router.replace({ name: 'Projects' });
          })
          .catch((error) => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
      }
    },
    hasActiveChild: function (project) {
      return (
        project.children &&
        project.children.some((child) => {
          return child.active || this.hasActiveChild(child);
        })
      );
    },
    createProjectLabel: function (project) {
      if (project.version) {
        return project.name + ' : ' + project.version;
      } else {
        return project.name;
      }
    },
    asyncFind: function (query) {
      if (query) {
        this.isLoading = true;
        let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/withoutDescendantsOf/${this.uuid}?searchText=${query}&excludeInactive=true`;
        this.axios.get(url).then((response) => {
          if (response.data) {
            this.availableParents = response.data;
            this.availableParents.unshift({
              name: '',
              version: '',
              uuid: null,
            });
          } else {
            this.availableParents = [{ name: '', version: '', uuid: null }];
          }
          this.isLoading = false;
        });
      }
    },
    searchTags: function () {
      if (!this.tag) {
        return;
      }

      clearTimeout(this.tagsAutoCompleteDebounce);
      this.tagsAutoCompleteDebounce = setTimeout(() => {
        const url = `${this.$api.BASE_URL}/${this.$api.URL_TAG}?searchText=${encodeURIComponent(this.tag)}&pageNumber=1&pageSize=6`;
        this.axios.get(url).then((response) => {
          this.tagsAutoCompleteItems = response.data.map((tag) => {
            return { text: tag.name };
          });
        });
      }, 250);
    },
    resetValues: function () {
      this.selectedParent = this.parent;
      this.availableParents = [{ name: '', version: '', uuid: null }];
    },
  },
};
</script>

<style lang="scss">
@import '../../../assets/scss/vendors/vue-tags-input/vue-tags-input';
</style>

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
