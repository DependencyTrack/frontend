<template>
  <b-modal
    id="projectDetailsModal"
    size="lg"
    hide-header-close
    no-stacking
    :title="$t('message.project_details')"
    @show="onShow"
    @hide="resetValues()"
  >
    <b-form ref="form" novalidate @submit.stop.prevent="updateProject()">
      <b-tabs
        v-model="activeTabIndex"
        class="body-bg-color"
        style="border: 0; padding: 0"
      >
        <b-tab class="body-bg-color" style="border: 0; padding: 0">
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
              :feedback-text="
                projectNameState === false
                  ? fieldFeedback.name || $t('message.required_project_name')
                  : ''
              "
              :state="projectNameState"
              :readonly="
                this.isNotPermitted([
                  PERMISSIONS.PORTFOLIO_MANAGEMENT,
                  PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                ])
              "
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
                  feedback="true"
                  autofocus="false"
                  :label="$t('message.version')"
                  :tooltip="this.$t('message.component_version_desc')"
                  :feedback-text="fieldFeedback.version || ''"
                  :state="versionState"
                  :readonly="
                    this.isNotPermitted([
                      PERMISSIONS.PORTFOLIO_MANAGEMENT,
                      PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                    ])
                  "
                />
              </b-col>
              <b-col cols="auto">
                <b-input-group-form-switch
                  id="project-details-islatest"
                  :label="$t('message.project_is_latest')"
                  v-model="project.isLatest"
                  :show-placeholder-label="true"
                  :tooltip="$t('message.is_latest_tooltip')"
                  :disabled="
                    !project.version ||
                    this.isNotPermitted([
                      PERMISSIONS.PORTFOLIO_MANAGEMENT,
                      PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                    ])
                  "
                />
              </b-col>
            </b-row>
            <b-input-group-form-select
              v-if="!isCollection"
              id="v-classifier-input"
              required="true"
              v-model="project.classifier"
              :options="sortAvailableClassifiers"
              :label="$t('message.classifier')"
              :tooltip="$t('message.component_classifier_desc')"
              feedback="true"
              :feedback-text="
                classifierState === false
                  ? fieldFeedback.classifier ||
                    $t('message.required_classifier')
                  : ''
              "
              :state="classifierState"
              :disabled="
                this.isNotPermitted([
                  PERMISSIONS.PORTFOLIO_MANAGEMENT,
                  PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                ])
              "
            />
            <b-input-group-form-switch
              id="project-details-is-collection"
              :label="$t('message.collection_project')"
              v-model="isCollection"
              @change="onCollectionToggle"
              :disabled="
                this.isNotPermitted([
                  PERMISSIONS.PORTFOLIO_MANAGEMENT,
                  PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                ])
              "
            />
            <b-input-group-form-select
              v-if="isCollection"
              id="v-collection-logic-input"
              required="true"
              v-model="project.collectionLogic"
              :options="availableCollectionLogics"
              :label="$t('message.collectionLogic')"
              :tooltip="$t('message.project_collection_logic_desc')"
              :disabled="
                this.isNotPermitted([
                  PERMISSIONS.PORTFOLIO_MANAGEMENT,
                  PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                ])
              "
              feedback="true"
              :feedback-text="
                collectionLogicState === false
                  ? fieldFeedback.collectionLogic ||
                    $t('message.required_collection_logic')
                  : ''
              "
              :state="collectionLogicState"
            />
            <b-form-group
              v-if="isCollection && showCollectionTags"
              id="project-collection-tag-form-group"
              :label="$t('message.project_add_collection_tag')"
              label-for="input-collectionTags"
            >
              <vue-tags-input
                id="input-collectionTags"
                v-model="collectionTagTyping"
                :tags="collectionTags"
                :add-on-key="addOnKeys"
                :placeholder="$t('message.project_add_collection_tag')"
                :autocomplete-items="tagsAutoCompleteItems"
                @tags-changed="
                  (newCollectionTags) =>
                    (this.collectionTags = newCollectionTags)
                "
                class="mw-100 bg-transparent text-lowercase"
                :max-tags="1"
                :readonly="
                  this.isNotPermitted([
                    PERMISSIONS.PORTFOLIO_MANAGEMENT,
                    PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                  ])
                "
              />
            </b-form-group>
            <div style="margin-bottom: 1rem">
              <label>{{ $t('message.parent') }}</label>
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
                :allow-empty="true"
                :show-no-results="true"
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
                id="project-description-input"
                v-model="project.description"
                rows="3"
                :readonly="
                  this.isNotPermitted([
                    PERMISSIONS.PORTFOLIO_MANAGEMENT,
                    PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                  ])
                "
              />
            </b-form-group>
            <b-form-group
              id="project-tags-form-group"
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
                :readonly="
                  this.isNotPermitted([
                    PERMISSIONS.PORTFOLIO_MANAGEMENT,
                    PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                  ])
                "
              />
            </b-form-group>
            <b-input-group-form-switch
              id="project-details-active"
              :label-on="$t('message.active')"
              :label-off="$t(`${inactiveSinceTimestamp}`)"
              v-model="project.active"
              :tooltip="$t('message.inactive_active_children')"
              :disabled="
                this.isNotPermitted([
                  PERMISSIONS.PORTFOLIO_MANAGEMENT,
                  PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                ]) ||
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
              id="project-group-input"
              input-group-size="mb-3"
              type="text"
              v-model="project.group"
              required="false"
              feedback="true"
              :label="$t('message.component_namespace_group_vendor')"
              :tooltip="this.$t('message.component_group_desc')"
              :feedback-text="fieldFeedback.group || ''"
              :state="groupState"
              :readonly="
                this.isNotPermitted([
                  PERMISSIONS.PORTFOLIO_MANAGEMENT,
                  PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                ])
              "
            />
            <b-input-group-form-input
              id="project-purl-input"
              input-group-size="mb-3"
              type="text"
              v-model="project.purl"
              required="false"
              feedback="true"
              :label="$t('message.package_url_full')"
              :tooltip="this.$t('message.component_package_url_desc')"
              :feedback-text="fieldFeedback.purl || ''"
              :state="purlState"
              :readonly="
                this.isNotPermitted([
                  PERMISSIONS.PORTFOLIO_MANAGEMENT,
                  PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                ])
              "
            />
            <b-input-group-form-input
              id="project-cpe-input"
              input-group-size="mb-3"
              type="text"
              v-model="project.cpe"
              required="false"
              feedback="true"
              :label="$t('message.cpe_full')"
              :tooltip="$t('message.component_cpe_desc')"
              :feedback-text="fieldFeedback.cpe || ''"
              :state="cpeState"
              :readonly="
                this.isNotPermitted([
                  PERMISSIONS.PORTFOLIO_MANAGEMENT,
                  PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                ])
              "
            />
            <b-input-group-form-input
              id="project-swidTagId-input"
              input-group-size="mb-3"
              type="text"
              v-model="project.swidTagId"
              required="false"
              feedback="true"
              :label="$t('message.swid_tagid')"
              :tooltip="$t('message.component_swid_tagid_desc')"
              :feedback-text="fieldFeedback.swidTagId || ''"
              :state="swidTagIdState"
              :readonly="
                this.isNotPermitted([
                  PERMISSIONS.PORTFOLIO_MANAGEMENT,
                  PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
                ])
              "
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
      <button type="submit" style="display: none" />
    </b-form>
    <template v-slot:modal-footer="{ cancel }">
      <b-button
        size="md"
        variant="outline-danger"
        :disabled="isUpdating"
        @click="deleteProject()"
        v-permission:or="[
          PERMISSIONS.PORTFOLIO_MANAGEMENT,
          PERMISSIONS.PORTFOLIO_MANAGEMENT_DELETE,
        ]"
        >{{ $t('message.delete') }}</b-button
      >
      <b-button
        size="md"
        variant="outline-primary"
        :disabled="isUpdating"
        v-b-modal.projectPropertiesModal
        v-permission:or="[
          PERMISSIONS.PORTFOLIO_MANAGEMENT,
          PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
        ]"
        >{{ $t('message.properties') }}</b-button
      >
      <b-button
        size="md"
        variant="secondary"
        :disabled="isUpdating"
        @click="cancel()"
        >{{ $t('message.close') }}</b-button
      >
      <b-button
        size="md"
        variant="primary"
        :disabled="isUpdating"
        @click="updateProject()"
        v-permission:or="[
          PERMISSIONS.PORTFOLIO_MANAGEMENT,
          PERMISSIONS.PORTFOLIO_MANAGEMENT_UPDATE,
        ]"
      >
        <b-spinner v-if="isUpdating" small class="mr-1"></b-spinner>
        {{ $t('message.update') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { cloneDeep } from 'lodash-es';
import BInputGroupFormInput from '../../../forms/BInputGroupFormInput';
import BInputGroupFormSelect from '../../../forms/BInputGroupFormSelect';
import VueTagsInput from '@johmun/vue-tags-input';
import permissionsMixin from '../../../mixins/permissionsMixin';
import common from '../../../shared/common';
import Multiselect from 'vue-multiselect';
import xssFilters from 'xss-filters';
import BInputGroupFormSwitch from '@/forms/BInputGroupFormSwitch.vue';
import availableClassifiersMixin from '@/mixins/availableClassifiersMixin';
import availableCollectionLogicsMixin from '@/mixins/availableCollectionLogicsMixin';
import projectFormMixin, {
  COLLECTION_LOGIC_AGGREGATE_TAG,
  FORM_FIELD_DEFAULTS,
} from './projectFormMixin';

const IDENTITY_TAB_INDEX = 1;

export default {
  name: 'ProjectDetailsModal',
  mixins: [
    permissionsMixin,
    availableClassifiersMixin,
    availableCollectionLogicsMixin,
    projectFormMixin,
  ],
  components: {
    BInputGroupFormSwitch,
    BInputGroupFormInput,
    BInputGroupFormSelect,
    VueTagsInput,
    Multiselect,
  },
  props: {
    projectInput: Object,
    uuid: String,
  },
  data() {
    return {
      project: { ...FORM_FIELD_DEFAULTS },
      parent: null,
      previousClassifier: null,
      isUpdating: false,
      activeTabIndex: 0,
      urlsTableColumns: [
        {
          title: this.$t('message.urls'),
          sortable: false,
          formatter(_, row) {
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
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.email'),
          field: 'email',
          sortable: false,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.phone'),
          field: 'phone',
          sortable: false,
          formatter(value) {
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
          formatter(value) {
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
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
        {
          title: this.$t('message.comment'),
          field: 'comment',
          sortable: false,
          formatter(value) {
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
  beforeMount() {
    this.$root.$on('initializeProjectDetailsModal', async () => {
      this.project = {
        ...FORM_FIELD_DEFAULTS,
        ...cloneDeep(this.projectInput),
      };
      const targetParentUuid = this.project.parent?.uuid || null;
      if (targetParentUuid !== (this.parent?.uuid || null)) {
        this.parent = targetParentUuid
          ? (
              await this.axios.get(
                `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/${targetParentUuid}`,
              )
            ).data
          : null;
        this.selectedParent = this.parent;
      }
      this.fetchDefaultParents();
      this.$root.$emit('bv::show::modal', 'projectDetailsModal');
    });
  },
  beforeDestroy() {
    this.$root.$off('initializeProjectDetailsModal');
  },
  methods: {
    onShow() {
      this.initializeTags();
      this.isCollection = !!this.project.collectionLogic;
      this.previousClassifier = this.project.classifier || null;
      // A project can carry a stale classifier from before it became a
      // collection. Drop it so the update payload explicitly clears it.
      if (this.isCollection) this.project.classifier = null;
    },
    initializeTags() {
      this.tags = (this.project.tags || []).map((tag) => ({ text: tag.name }));
      this.collectionTags = this.project.collectionTag
        ? [{ text: this.project.collectionTag.name }]
        : [];
    },
    onCollectionToggle(value) {
      if (value) {
        this.previousClassifier = this.project.classifier || null;
        this.project.classifier = null;
      } else {
        this.project.classifier = this.previousClassifier || null;
        this.project.collectionLogic = null;
        this.collectionTagTyping = '';
        this.collectionTags = [];
      }
    },
    updateProject() {
      this.resetValidationFeedback();
      if (!this.validate()) {
        this.scrollToFirstError();
        return;
      }

      this.isUpdating = true;
      const url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`;
      const parent = this.selectedParent
        ? { uuid: this.selectedParent.uuid }
        : null;
      const tagsNode = this.tags.map((tag) => ({ name: tag.text }));
      const collectionTag =
        this.project.collectionLogic === COLLECTION_LOGIC_AGGREGATE_TAG &&
        this.collectionTags.length > 0
          ? { name: this.collectionTags[0].text }
          : null;
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
          collectionTag,
          parent,
          cpe: this.project.cpe,
          purl: this.project.purl,
          swidTagId: this.project.swidTagId,
          tags: tagsNode,
          active: this.project.active,
          isLatest: this.project.isLatest,
          externalReferences: this.project.externalReferences,
        })
        .then((response) => {
          this.isUpdating = false;
          this.$emit('projectUpdated', response.data);
          this.$toastr.s(this.$t('message.project_updated'));
          this.parent = this.selectedParent;
          this.$root.$emit('bv::hide::modal', 'projectDetailsModal');
        })
        .catch((error) => {
          this.isUpdating = false;
          if (this.applyValidationErrors(error)) {
            this.activeTabIndex = IDENTITY_TAB_INDEX;
          }
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
          .then(() => {
            this.$toastr.s(this.$t('message.project_deleted'));
            this.$router.replace({ name: 'Projects' });
          })
          .catch(() => {
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
    parentSearchUrl(searchText) {
      return common.setQueryParams(
        `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/withoutDescendantsOf/${this.uuid}`,
        {
          excludeInactive: true,
          pageSize: 10,
          pageNumber: 1,
          searchText: searchText || null,
        },
      );
    },
    resetValues() {
      this.selectedParent = this.parent;
      this.availableParents = this.defaultParents;
      this.submitted = false;
      this.isUpdating = false;
      this.activeTabIndex = 0;
      this.resetValidationFeedback();
      this.resetTagInputs();
    },
  },
  computed: {
    inactiveSinceTimestamp: function () {
      return this.project.inactiveSince
        ? this.$t('message.inactive_since') +
            ': ' +
            common.formatTimestamp(this.project.inactiveSince, true)
        : this.$t('message.inactive');
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
