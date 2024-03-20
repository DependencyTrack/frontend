<template>
  <b-modal
    id="createLdapUserModal"
    size="md"
    @hide="resetValues()"
    hide-header-close
    no-stacking
    :title="$t('admin.create_ldap_user')"
  >
    <b-input-group-form-input
      id="username-input"
      input-group-size="mb-3"
      type="text"
      v-model="username"
      lazy="true"
      required="true"
      feedback="true"
      autofocus="false"
      :label="$t('message.username')"
      :feedback-text="$t('admin.required_username')"
    />

    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button size="md" variant="primary" @click="createUser()">{{
        $t('message.create')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import permissionsMixin from '../../../mixins/permissionsMixin';
import BInputGroupFormInput from '../../../forms/BInputGroupFormInput';

export default {
  mixins: [permissionsMixin],
  components: {
    BInputGroupFormInput,
  },
  data() {
    return {
      username: null,
    };
  },
  methods: {
    createUser: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_USER_LDAP}`;
      this.axios
        .put(url, {
          username: this.username,
        })
        .then((response) => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.user_created'));
        })
        .catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      this.$root.$emit('bv::hide::modal', 'createLdapUserModal');
      this.resetValues();
    },
    resetValues: function () {
      this.username = null;
    },
  },
};
</script>
