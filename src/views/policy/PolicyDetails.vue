<template>
  <div>
    <b-row class="expanded-row">
      <b-col sm="6">
        <b-input-group-form-input
          id="identifier"
          :label="this.$t('message.name')"
          input-group-size="mb-3"
          required="true"
          type="text"
          v-model="name"
          lazy="true"
          autofocus="true"
          @keyup="debouncedUpdatePolicy"
        />
      </b-col>
      <b-col sm="3">
        <b-input-group-form-select
          id="input-repository-type"
          required="true"
          v-model="operator"
          :options="operators"
          :label="$t('message.operator')"
        />
      </b-col>
      <b-col sm="3">
        <b-input-group-form-select
          id="input-repository-type"
          required="true"
          v-model="violationState"
          :options="violationStates"
          :label="$t('message.violation_state')"
        />
      </b-col>
    </b-row>
    <b-row class="expanded-row">
      <b-col sm="12">
        <b-form-group :label="this.$t('message.conditions')">
          <div class="list-group">
            <span
              v-for="(condition, conditionIndex) in conditions"
              :key="conditionIndex"
            >
              <policy-condition
                :policy="policy"
                :condition="condition"
                v-on:conditionRemoved="
                  removeCondition(condition, conditionIndex)
                "
              />
            </span>
            <actionable-list-group-item
              v-permission:or="[
                PERMISSIONS.POLICY_MANAGEMENT,
                PERMISSIONS.POLICY_MANAGEMENT_UPDATE,
              ]"
              :add-icon="true"
              v-on:actionClicked="addCondition"
            />
          </div>
        </b-form-group>
        <b-form-group
          v-if="limitToVisible === true"
          id="projectLimitsList"
          :label="this.$t('admin.limit_to_projects')"
        >
          <div class="list-group">
            <span v-for="project in projects" :key="project.uuid">
              <actionable-list-group-item
                :value="formatLabel(project.name, project.version)"
                :delete-icon="true"
                v-on:actionClicked="deleteProjectLimiter(project.uuid)"
              />
            </span>
            <actionable-list-group-item
              v-permission:or="[
                PERMISSIONS.POLICY_MANAGEMENT,
                PERMISSIONS.POLICY_MANAGEMENT_UPDATE,
              ]"
              :add-icon="true"
              v-on:actionClicked="showSelectProjectModal = true"
            />
          </div>
        </b-form-group>
        <div v-if="limitToVisible === true" style="margin-bottom: 1.5rem">
          <b-row>
            <b-col cols="auto">
              <b-input-group-form-switch
                id="isNotifyChildrenEnabled"
                :label="$t('admin.include_children')"
                v-model="includeChildren"
              />
            </b-col>
            <b-col>
              <b-input-group-form-switch
                id="isOnlyLatestProjectVersion"
                :label="$t('message.policy_is_only_for_latest_project_version')"
                v-model="onlyLatestProjectVersion"
              />
            </b-col>
          </b-row>
        </div>
        <b-form-group
          v-if="limitToVisible === true"
          id="tagLimitsList"
          :label="
            invertTagMatch
              ? this.$t('admin.exclude_tags')
              : this.$t('admin.limit_to_tags')
          "
        >
          <b-input-group-form-switch
            id="isInvertTagMatch"
            :label="$t('admin.invert_tag_match')"
            v-model="invertTagMatch"
          />
          <div class="list-group">
            <span v-for="tag in tags" :key="tag.name">
              <actionable-list-group-item
                :value="formatLabel(tag.name, tag.id)"
                :delete-icon="true"
                v-on:actionClicked="deleteTagLimiter(tag.name)"
              />
            </span>
            <actionable-list-group-item
              v-permission:or="[
                PERMISSIONS.POLICY_MANAGEMENT,
                PERMISSIONS.POLICY_MANAGEMENT_UPDATE,
              ]"
              :add-icon="true"
              v-on:actionClicked="showSelectTagModal = true"
            />
          </div>
        </b-form-group>
        <div style="text-align: right">
          <b-toggleable-display-button
            variant="outline-primary"
            :label="$t('admin.limit_to')"
            v-permission="PERMISSIONS.VIEW_PORTFOLIO"
            v-on:toggle="limitToVisible = !limitToVisible"
          />
          <b-button
            v-permission:or="['POLICY_MANAGEMENT', 'POLICY_MANAGEMENT_DELETE']"
            variant="outline-danger"
            @click="deletePolicy"
            >{{ $t('message.delete_policy') }}</b-button
          >
        </div>
      </b-col>
    </b-row>
    <select-project-modal
      v-model="showSelectProjectModal"
      v-on:selection="updateProjectSelection"
    />
    <select-tag-modal
      v-model="showSelectTagModal"
      :policy="policy"
      v-on:selection="updateTagSelection"
    />
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import permissionsMixin from '../../mixins/permissionsMixin';
import ActionableListGroupItem from '../components/ActionableListGroupItem.vue';
import BInputGroupFormInput from '../../forms/BInputGroupFormInput.vue';
import EventBus from '../../shared/eventbus';
import BInputGroupFormSelect from '../../forms/BInputGroupFormSelect.vue';
import PolicyCondition from './PolicyCondition.vue';
import BToggleableDisplayButton from '@/views/components/BToggleableDisplayButton.vue';
import SelectProjectModal from '@/views/portfolio/projects/SelectProjectModal.vue';
import SelectTagModal from '@/views/portfolio/tags/SelectTagModal.vue';
import BInputGroupFormSwitch from '@/forms/BInputGroupFormSwitch.vue';

export default {
  props: {
    row: Object,
    index: Number,
  },
  mixins: [permissionsMixin],
  components: {
    ActionableListGroupItem,
    BInputGroupFormInput,
    BInputGroupFormSelect,
    BToggleableDisplayButton,
    SelectProjectModal,
    SelectTagModal,
    PolicyCondition,
    BInputGroupFormSwitch,
  },
  data() {
    return {
      showSelectProjectModal: false,
      showSelectTagModal: false,
      policy: this.row,
      name: this.row.name,
      operator: this.row.operator,
      violationState: this.row.violationState,
      conditions: this.row.policyConditions,
      operators: [
        { value: 'ANY', text: 'Any' },
        { value: 'ALL', text: 'All' },
      ],
      violationStates: [
        { value: 'INFO', text: this.$t('violation.info') },
        { value: 'WARN', text: this.$t('violation.warn') },
        { value: 'FAIL', text: this.$t('violation.fail') },
      ],
      projects: this.row.projects || [],
      limitToVisible: false,
      tags: this.row.tags,
      includeChildren: this.row.includeChildren,
      onlyLatestProjectVersion: this.row.onlyLatestProjectVersion,
      invertTagMatch: this.row.invertTagMatch || false,
    };
  },
  created() {
    this.debouncedUpdatePolicy = debounce(this.updatePolicy, 750);
  },
  methods: {
    formatLabel: function (labelName, labelProperty) {
      if (labelName && labelProperty) {
        return labelName + ' ' + labelProperty;
      } else {
        return labelName;
      }
    },
    addCondition: function () {
      if (!this.conditions) {
        this.conditions = [];
      }
      this.conditions.push({});
    },
    removeCondition: function () {
      this.conditions = [];
      this.refreshPolicy();
      //this.conditions.splice(conditionIndex, 1);
    },
    refreshPolicy: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/${this.policy.uuid}`;
      this.axios.get(url).then((response) => {
        this.policy = response.data;
        EventBus.emit(
          'policyManagement:policies:rowUpdate',
          this.index,
          this.policy,
        );
      });
    },
    updatePolicy: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}`;
      let refreshTableRow =
        this.policy.uuid === null || this.name !== this.policy.name;
      this.axios
        .post(url, {
          uuid: this.policy.uuid,
          name: this.name,
          operator: this.operator,
          violationState: this.violationState,
          includeChildren: this.includeChildren,
          onlyLatestProjectVersion: this.onlyLatestProjectVersion,
          invertTagMatch: this.invertTagMatch,
        })
        .then((response) => {
          // prevent that "limit to" details are hidden after updates where table does not need to refresh
          if (refreshTableRow) {
            this.policy = response.data;
            EventBus.emit(
              'policyManagement:policies:rowUpdate',
              this.index,
              this.policy,
            );
          }
          this.$toastr.s(this.$t('message.updated'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    deletePolicy: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/${this.policy.uuid}`;
      this.axios
        .delete(url)
        .then(() => {
          EventBus.emit('policyManagement:policies:rowDeleted', this.index);
          this.$toastr.s(this.$t('message.policy_deleted'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    syncVariables: function (policy) {
      this.policy = policy;
      this.name = policy.name;
      this.operator = policy.operator;
      this.violationState = policy.violationState;
      this.conditions = policy.policyConditions;
      this.includeChildren = policy.includeChildren;
      this.onlyLatestProjectVersion = policy.onlyLatestProjectVersion;
      this.invertTagMatch = policy.invertTagMatch;
    },
    deleteProjectLimiter: function (projectUuid) {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/${this.policy.uuid}/project/${projectUuid}`;
      this.axios
        .delete(url)
        .then(() => {
          let p = [];
          for (let i = 0; i < this.projects.length; i++) {
            if (this.projects[i].uuid !== projectUuid) {
              p.push(this.projects[i]);
            }
          }
          this.projects = p;
          this.$toastr.s(this.$t('message.updated'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    deleteTagLimiter: function (tagName) {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_TAG}/${encodeURIComponent(tagName)}/policy`;
      this.axios.delete(url, { data: [this.policy.uuid] }).then(() => {
        let p = [];
        for (let i = 0; i < this.tags.length; i++) {
          if (this.tags[i].name !== tagName) {
            p.push(this.tags[i]);
          }
        }
        this.tags = p;
        this.$toastr.s(this.$t('message.updated'));
      });
    },
    updateProjectSelection: function (selections) {
      this.showSelectProjectModal = false;
      for (let i = 0; i < selections.length; i++) {
        let selection = selections[i];
        let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/${this.policy.uuid}/project/${selection.uuid}`;
        this.axios
          .post(url)
          .then(() => {
            this.projects.push(selection);
            this.$toastr.s(this.$t('message.updated'));
          })
          .catch((error) => {
            if (error.response.status === 304) {
              //this.$toastr.w(this.$t('condition.unsuccessful_action'));
            } else {
              this.$toastr.w(this.$t('condition.unsuccessful_action'));
            }
          });
      }
    },
    updateTagSelection: function (selections) {
      this.showSelectTagModal = false;
      let promises = [];
      for (let i = 0; i < selections.length; i++) {
        let selection = selections[i];
        let url = `${this.$api.BASE_URL}/${this.$api.URL_TAG}/${encodeURIComponent(selection.name)}/policy`;
        promises.push(
          this.axios
            .post(url, [this.policy.uuid])
            .then(() => Promise.resolve(selection.name)),
        );
      }
      Promise.all(promises).then((addedTagNames) => {
        for (const tagName of addedTagNames) {
          if (!this.tags.some((tag) => tag.name === tagName)) {
            this.tags.push({ name: tagName });
          }
        }
        this.$toastr.s(this.$t('message.updated'));
      });
    },
  },
  watch: {
    operator() {
      this.updatePolicy();
    },
    violationState() {
      this.updatePolicy();
    },
    includeChildren() {
      this.updatePolicy();
    },
    onlyLatestProjectVersion() {
      this.updatePolicy();
    },
    invertTagMatch() {
      this.updatePolicy();
    },
  },
};
</script>
