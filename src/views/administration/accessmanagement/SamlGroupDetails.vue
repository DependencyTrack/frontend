<template>
  <b-row class="expanded-row">
    <b-col sm="6">
      <b-form-group :label="this.$t('admin.mapped_teams')">
        <div class="list-group">
          <span v-for="mappedTeam in mappedTeams" :key="mappedTeam.uuid">
            <actionable-list-group-item
              :value="mappedTeam.name"
              :delete-icon="true"
              v-on:actionClicked="removeSamlGroupMapping(mappedTeam)"
            />
          </span>
          <actionable-list-group-item
            :add-icon="true"
            v-on:actionClicked="showSelectTeamModal = true"
          />
        </div>
      </b-form-group>
    </b-col>
    <b-col sm="6">
      <div style="text-align: right">
        <b-button variant="outline-danger" @click="deleteSamlGroup">{{
          $t('admin.delete_saml_group')
        }}</b-button>
      </div>
    </b-col>
    <select-team-modal
      v-model="showSelectTeamModal"
      :currentTeams="mappedTeams"
      v-on:selection="updateTeamSelection"
    />
  </b-row>
</template>

<script>
import EventBus from '../../../shared/eventbus';
import ActionableListGroupItem from '../../components/ActionableListGroupItem.vue';
import permissionsMixin from '../../../mixins/permissionsMixin';
import SelectTeamModal from './SelectTeamModal.vue';

export default {
  props: {
    row: { type: Object, required: true },
    index: { type: Number, required: true },
    rowEvents: { update: { type: String }, delete: { type: String } },
  },
  mixins: [permissionsMixin],
  components: {
    ActionableListGroupItem,
    SelectTeamModal,
  },
  data() {
    return {
      showSelectTeamModal: false,
      mappedTeams: this.row.teams ?? [],
    };
  },
  computed: {
    groupUrl() {
      return `${this.$api.BASE_URL}/${this.$api.URL_SAML_GROUP}/${this.row.uuid}`;
    },
  },
  methods: {
    deleteSamlGroup: async function () {
      if (
        !(await this.$confirmDelete({
          title: this.$t('admin.delete_saml_group'),
        }))
      )
        return;
      try {
        await this.axios.delete(this.groupUrl);
        EventBus.emit(this.rowEvents.delete, this.index);
        this.$toastr.s(this.$t('admin.saml_group_deleted'));
      } catch {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    updateTeamSelection: async function (selections) {
      this.showSelectTeamModal = false;
      try {
        await Promise.all(
          selections.map((team) =>
            this.axios.put(`${this.groupUrl}/teams/${team.uuid}`),
          ),
        );
        const known = new Set(this.mappedTeams.map((team) => team.uuid));
        const added = selections
          .filter((team) => !known.has(team.uuid))
          .map((team) => ({ uuid: team.uuid, name: team.name }));
        this.mappedTeams = [...this.mappedTeams, ...added].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        this.emitRowUpdate();
        this.$toastr.s(this.$t('message.updated'));
      } catch {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    removeSamlGroupMapping: async function (team) {
      try {
        await this.axios.delete(`${this.groupUrl}/teams/${team.uuid}`);
        this.mappedTeams = this.mappedTeams.filter((t) => t.uuid !== team.uuid);
        this.emitRowUpdate();
        this.$toastr.s(this.$t('message.updated'));
      } catch {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    emitRowUpdate: function () {
      EventBus.emit(this.rowEvents.update, this.index, {
        ...this.row,
        teams: this.mappedTeams,
      });
    },
  },
};
</script>
