<template>
  <b-modal id="createTeamModal" size="md" @hide="resetValues()" hide-header-close no-stacking :title="$t('admin.create_team')">

    <b-input-group-form-input id="name-input" input-group-size="mb-3" type="text" v-model="name"
                              lazy="true" required="true" feedback="true" autofocus="false"
                              :label="$t('admin.team_name')"
                              :feedback-text="$t('admin.required_team_name')" />

    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.close') }}</b-button>
      <b-button size="md" variant="primary" @click="createUser()">{{ $t('message.create') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import permissionsMixin from "../../../mixins/permissionsMixin";
  import BInputGroupFormInput from "../../../forms/BInputGroupFormInput";

  export default {
    mixins: [permissionsMixin],
    components: {
      BInputGroupFormInput
    },
    data() {
      return {
        name: null
      }
    },
    methods: {
      createUser: function() {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_TEAM}`;
        this.axios.put(url,{
          name: this.name
        }).then((response) => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.team_created'));
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
        this.$root.$emit('bv::hide::modal', 'createTeamModal');
        this.resetValues();
      },
      resetValues: function () {
        this.name = null;
      }
    }
  }
</script>
