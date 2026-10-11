<template>
  <b-row class="expanded-row">
    <b-col sm="6">
      <b-input-group-form-input
        id="input-oidcgroup-name"
        :label="$t('admin.oidc_group_name')"
        input-group-size="mb-3"
        required="true"
        type="text"
        v-model="oidcGroup.name"
        lazy="true"
        autofocus="true"
        @keyup="debouncedUpdateOidcGroup"
      />
      <b-form-group :label="this.$t('admin.mapped_teams')">
        <div class="list-group">
          <span v-for="mappedTeam in mappedTeams" :key="mappedTeam.uuid">
            <actionable-list-group-item
              :value="mappedTeam.name"
              :delete-icon="true"
              v-on:actionClicked="removeOidcGroupMapping(mappedTeam)"
            />
          </span>
          <actionable-list-group-item
            :add-icon="true"
            v-on:actionClicked="
              $root.$emit('bv::show::modal', 'selectTeamModal')
            "
          />
        </div>
      </b-form-group>
    </b-col>
    <b-col sm="6">
      <div style="text-align: right">
        <b-button variant="outline-danger" @click="deleteOidcGroup">{{
          $t('admin.delete_oidc_group')
        }}</b-button>
      </div>
    </b-col>
    <select-team-modal v-on:selection="updateTeamSelection" />
  </b-row>
</template>

<script>
import { debounce } from 'lodash-es';
import EventBus from '../../../shared/eventbus';
import ActionableListGroupItem from '../../components/ActionableListGroupItem.vue';
import permissionsMixin from '../../../mixins/permissionsMixin';
import BInputGroupFormInput from '../../../forms/BInputGroupFormInput.vue';
import SelectTeamModal from './SelectTeamModal.vue';

export default {
  props: {
    row: Object,
    index: Number,
  },
  mixins: [permissionsMixin],
  components: {
    ActionableListGroupItem,
    BInputGroupFormInput,
    SelectTeamModal,
  },
  data() {
    return {
      oidcGroup: this.row,
      mappedTeams: [],
    };
  },
  created() {
    this.debouncedUpdateOidcGroup = debounce(this.updateOidcGroup, 750);
  },
  methods: {
    updateOidcGroup: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_GROUP}`;
      this.axios
        .post(url, {
          uuid: this.oidcGroup.uuid,
          name: this.oidcGroup.name,
        })
        .then((response) => {
          this.team = response.data;
          EventBus.emit('admin:oidcgroups:rowUpdate', this.index, this.team);
          this.$toastr.s(this.$t('message.updated'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    deleteOidcGroup: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_GROUP}/${this.oidcGroup.uuid}`;
      this.axios
        .delete(url)
        .then(() => {
          EventBus.emit('admin:oidcgroups:rowDeleted', this.index);
          this.$toastr.s(this.$t('admin.oidc_group_deleted'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    getMappedTeams: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_GROUP}/${this.oidcGroup.uuid}/team`;
      this.axios
        .get(url)
        .then((response) => {
          this.mappedTeams = response.data;
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    updateTeamSelection: function (selections) {
      this.$root.$emit('bv::hide::modal', 'selectTeamModal');
      for (let i = 0; i < selections.length; i++) {
        let selection = selections[i];
        let url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_MAPPING}`;
        this.axios
          .put(url, {
            group: this.oidcGroup.uuid,
            team: selection.uuid,
          })
          .then(() => {
            this.mappedTeams.push(selection);
            this.mappedTeams.sort();
            this.$toastr.s(this.$t('message.updated'));
          })
          .catch(() => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
      }
    },
    removeOidcGroupMapping: function (team) {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_OIDC_GROUP}/${this.oidcGroup.uuid}/team/${team.uuid}/mapping`;
      this.axios
        .delete(url)
        .then(() => {
          let remainingTeams = [];
          for (let i = 0; i < this.mappedTeams.length; i++) {
            if (this.mappedTeams[i].uuid !== team.uuid) {
              remainingTeams.push(this.mappedTeams[i]);
            }
          }
          this.mappedTeams = remainingTeams;
          this.$toastr.s(this.$t('message.updated'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
  },
  mounted: function () {
    this.getMappedTeams();
  },
};
</script>
