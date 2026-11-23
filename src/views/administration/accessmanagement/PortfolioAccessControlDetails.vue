<template>
  <b-row class="expanded-row">
    <b-col sm="6">
      <b-form-group :label="this.$t('admin.project_access')">
        <div class="list-group">
          <span v-for="project in projects" :key="project.uuid">
            <actionable-list-group-item
              :value="projectLabel(project.name, project.version)"
              :href="projectUri(project.uuid)"
              :delete-icon="true"
              v-on:actionClicked="removeProjectMapping(project.uuid)"
            />
          </span>
          <actionable-list-group-item
            :add-icon="true"
            v-on:actionClicked="showSelectProjectModal = true"
          />
        </div>
      </b-form-group>
    </b-col>
    <b-col sm="6"> </b-col>
    <select-project-modal
      v-model="showSelectProjectModal"
      v-on:selection="updateProjectSelection"
      :teamUuid="team.uuid"
    />
  </b-row>
</template>

<script>
import xssFilters from 'xss-filters';
import ActionableListGroupItem from '../../components/ActionableListGroupItem.vue';
import SelectProjectModal from './SelectProjectModal.vue';
import permissionsMixin from '../../../mixins/permissionsMixin';
import router from '@/router';

export default {
  props: {
    row: Object,
  },
  mixins: [permissionsMixin],
  components: {
    ActionableListGroupItem,
    SelectProjectModal,
  },
  data() {
    return {
      showSelectProjectModal: false,
      team: this.row,
      projects: this.row.mappedLdapGroups,
    };
  },
  methods: {
    projectLabel: function (name, version) {
      if (version) {
        return name + ' ' + version;
      } else {
        return name;
      }
    },
    projectUri: function (uuid) {
      const href = router.resolve({
        name: 'Project',
        params: { uuid: uuid },
      }).href;
      const sanitizedHref = xssFilters.uriInUnQuotedAttr(href);
      return sanitizedHref;
    },
    updateProjectSelection: function (selections) {
      this.showSelectProjectModal = false;
      for (let i = 0; i < selections.length; i++) {
        let selection = selections[i];
        let url = `${this.$api.BASE_URL}/${this.$api.URL_ACL_MAPPING}`;
        this.axios
          .put(url, {
            team: this.team.uuid,
            project: selection.uuid,
          })
          .then(() => {
            if (this.projects === undefined || this.projects === null) {
              this.projects = [];
            }
            this.projects.push({
              name: selection.name,
              version: selection.version,
              uuid: selection.uuid,
            });
            this.projects.sort();
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
    removeProjectMapping: function (projectUuid) {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_ACL_MAPPING}/team/${this.team.uuid}/project/${projectUuid}`;
      this.axios
        .delete(url)
        .then(() => {
          let k = [];
          for (let i = 0; i < this.projects.length; i++) {
            if (this.projects[i].uuid !== projectUuid) {
              k.push(this.projects[i]);
            }
          }
          this.projects = k;
          this.$toastr.s(this.$t('message.updated'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
  },
  mounted() {
    let url = `${this.$api.BASE_URL}/${this.$api.URL_ACL_TEAM}/${this.team.uuid}`;
    this.axios
      .get(url)
      .then((response) => {
        this.projects = response.data;
      })
      .catch(() => {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      });
  },
};
</script>
