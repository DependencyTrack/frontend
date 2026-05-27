<template>
  <b-modal
    id="projectCreateProjectModal"
    @hide="resetValues()"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('message.create_project')"
  >
    <b-form ref="form" novalidate @submit.stop.prevent="createProject()">
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
            />
          </b-col>
          <b-col cols="auto">
            <b-input-group-form-switch
              id="project-create-islatest"
              :label="$t('message.project_is_latest')"
              v-model="project.isLatest"
              :show-placeholder-label="true"
              :tooltip="$t('message.is_latest_tooltip')"
              :disabled="!project.version"
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
              ? fieldFeedback.classifier || $t('message.required_classifier')
              : ''
          "
          :state="classifierState"
        />
        <b-input-group-form-switch
          id="project-create-is-collection"
          :label="$t('message.collection_project')"
          v-model="isCollection"
          @change="onCollectionToggle"
        />
        <b-input-group-form-select
          v-if="isCollection"
          id="v-collection-logic-input"
          required="true"
          v-model="project.collectionLogic"
          :options="availableCollectionLogics"
          :label="$t('message.collectionLogic')"
          :tooltip="$t('message.project_collection_logic_desc')"
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
              (newCollectionTags) => (this.collectionTags = newCollectionTags)
            "
            class="mw-100 bg-transparent text-lowercase"
            :max-tags="1"
          />
        </b-form-group>
        <div v-if="requiresTeam" style="margin-bottom: 1rem">
          <label class="required">{{ $t('message.team') }}</label>
          <multiselect
            v-model="selectedTeams"
            :options="availableTeams"
            :multiple="true"
            :close-on-select="false"
            :placeholder="$t('message.component_team_desc')"
            label="text"
            track-by="value"
            :disabled="isDisabled"
            :class="{ 'is-invalid': teamsState === false }"
            selectLabel=""
            deselectLabel=""
          ></multiselect>
          <div v-if="teamsState === false" class="invalid-feedback d-block">
            {{ $t('message.required_team') }}
          </div>
        </div>
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
          />
        </b-form-group>
        <hr class="my-3" />
        <button
          type="button"
          v-b-toggle.identity-collapse
          :aria-expanded="showIdentity ? 'true' : 'false'"
          aria-controls="identity-collapse"
          class="btn btn-link d-flex align-items-center mb-2 p-0 text-decoration-none text-reset w-100"
        >
          <i class="fa fa-cube mr-2"></i>
          <strong>{{ $t('message.identity') }}</strong>
          <small v-if="!showIdentity" class="text-muted ml-2">{{
            identityHint
          }}</small>
          <i
            class="fa ml-auto"
            :class="showIdentity ? 'fa-chevron-up' : 'fa-chevron-down'"
          ></i>
        </button>
        <b-collapse id="identity-collapse" v-model="showIdentity">
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
          />
        </b-collapse>
      </b-card>
      <button type="submit" style="display: none" />
    </b-form>
    <template v-slot:modal-footer="{ cancel }">
      <b-button
        size="md"
        variant="secondary"
        :disabled="isCreating"
        @click="cancel()"
        >{{ $t('message.cancel') }}</b-button
      >
      <b-button
        size="md"
        variant="primary"
        :disabled="isCreating"
        @click="createProject()"
      >
        <b-spinner v-if="isCreating" small class="mr-1"></b-spinner>
        {{ $t('message.create') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import BInputGroupFormInput from '../../../forms/BInputGroupFormInput';
import BInputGroupFormSelect from '../../../forms/BInputGroupFormSelect';
import VueTagsInput from '@johmun/vue-tags-input';
import permissionsMixin from '../../../mixins/permissionsMixin';
import Multiselect from 'vue-multiselect';
import BInputGroupFormSwitch from '@/forms/BInputGroupFormSwitch.vue';
import common from '../../../shared/common';
import availableClassifiersMixin from '@/mixins/availableClassifiersMixin';
import availableCollectionLogicsMixin from '@/mixins/availableCollectionLogicsMixin';
import projectFormMixin, {
  COLLECTION_LOGIC_AGGREGATE_TAG,
  DEFAULT_CLASSIFIER,
  FORM_FIELD_DEFAULTS,
} from './projectFormMixin';

export default {
  name: 'ProjectCreateProjectModal',
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
  data() {
    return {
      requiresTeam: true,
      isDisabled: false,
      availableTeams: [],
      selectedTeams: [],
      project: { ...FORM_FIELD_DEFAULTS, classifier: DEFAULT_CLASSIFIER },
      teams: [],
      showIdentity: false,
      isCreating: false,
    };
  },
  beforeMount() {
    this.$root.$on('initializeProjectCreateProjectModal', async () => {
      this.resetValues();
      await this.getACLEnabled();
      await this.getAvailableTeams();
      this.fetchDefaultParents();
      this.$root.$emit('bv::show::modal', 'projectCreateProjectModal');
    });
  },
  beforeDestroy() {
    this.$root.$off('initializeProjectCreateProjectModal');
  },
  computed: {
    teamsState() {
      if (!this.requiresTeam || !this.submitted) return undefined;
      return this.selectedTeams.length > 0;
    },
    identityHint() {
      const fields = [
        this.project.group,
        this.project.purl,
        this.project.cpe,
        this.project.swidTagId,
      ].filter(Boolean);
      if (fields.length > 0) {
        return this.$t('message.identity_fields_set', {
          count: fields.length,
        });
      }
      return this.$t('message.optional');
    },
  },
  methods: {
    validate() {
      if (!projectFormMixin.methods.validate.call(this)) return false;
      if (this.requiresTeam && this.selectedTeams.length === 0) return false;
      return true;
    },
    async getACLEnabled() {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/public/access-management/acl.enabled`;
      let response = await this.axios.get(url);
      this.requiresTeam = common.toBoolean(
        response.data.propertyValue.toString(),
      );
    },
    async getAvailableTeams() {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}/visible`;
      let response = await this.axios.get(url);
      this.availableTeams = response.data.map((team) => {
        return { text: team.name, value: team.uuid };
      });
      this.teams = response.data;
      if (this.requiresTeam && this.availableTeams.length === 1) {
        this.selectedTeams = [this.availableTeams[0]];
        this.isDisabled = true;
      } else {
        this.isDisabled = false;
      }
      this.availableTeams.sort(function (a, b) {
        return a.text.localeCompare(b.text);
      });
    },
    onCollectionToggle(value) {
      if (value) {
        this.project.classifier = null;
      } else {
        this.project.classifier = DEFAULT_CLASSIFIER;
        this.project.collectionLogic = null;
        this.collectionTagTyping = '';
        this.collectionTags = [];
      }
    },
    createProject() {
      this.resetValidationFeedback();
      if (!this.validate()) {
        this.scrollToFirstError();
        return;
      }

      this.isCreating = true;
      const url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}`;
      const chosenTeams = this.teams
        .filter((team) =>
          this.selectedTeams.some((st) => st.value === team.uuid),
        )
        .map((team) => ({ ...team, apiKeys: [] }));
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
        .put(url, {
          name: this.project.name,
          version: this.project.version,
          group: this.project.group,
          description: this.project.description,
          parent,
          classifier: this.project.classifier,
          accessTeams: chosenTeams,
          collectionLogic: this.project.collectionLogic,
          collectionTag,
          purl: this.project.purl,
          cpe: this.project.cpe,
          swidTagId: this.project.swidTagId,
          copyright: this.project.copyright,
          tags: tagsNode,
          active: true,
          isLatest: this.project.isLatest,
        })
        .then((response) => {
          this.isCreating = false;
          this.$toastr.s(this.$t('message.project_created'));
          this.$root.$emit('bv::hide::modal', 'projectCreateProjectModal');
          this.$router.push({ path: '/projects/' + response.data.uuid });
        })
        .catch((error) => {
          this.isCreating = false;
          if (this.applyValidationErrors(error)) {
            this.showIdentity = true;
          }
        });
    },
    parentSearchUrl(searchText) {
      return common.setQueryParams(
        `${this.$api.BASE_URL}/${this.$api.URL_PROJECT_CONCISE}`,
        {
          excludeInactive: true,
          pageSize: 10,
          pageNumber: 1,
          searchText: searchText || null,
        },
      );
    },
    resetValues() {
      this.project = { ...FORM_FIELD_DEFAULTS, classifier: DEFAULT_CLASSIFIER };
      this.isDisabled = false;
      this.tags = [];
      this.collectionTags = [];
      this.selectedParent = null;
      this.selectedTeams = [];
      this.availableParents = this.defaultParents;
      this.isCollection = false;
      this.showIdentity = false;
      this.isCreating = false;
      this.submitted = false;
      this.resetValidationFeedback();
      this.resetTagInputs();
    },
  },
};
</script>

<style lang="scss">
@import '../../../assets/scss/vendors/vue-tags-input/vue-tags-input';
</style>
