<template>
  <b-modal id="profileEditModal" size="md" @show="getSelf" @hidden="resetValues" hide-header-close no-stacking :title="$t('message.profile_update')">

    <b-input-group-form-input id="fullname-input" input-group-size="mb-3" type="text" v-model="fullname"
                              lazy="true" required="true" feedback="true" autofocus="false"
                              :label="$t('message.fullname')"
                              :feedback-text="$t('admin.required_fullname')" />
    <b-input-group-form-input id="email-input" input-group-size="mb-3" type="text" v-model="email"
                              lazy="true" required="true" feedback="true" autofocus="false"
                              :label="$t('message.email')"
                              :feedback-text="$t('admin.required_email')" />

    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.close') }}</b-button>
      <b-button size="md" variant="primary" @click="updateUser()">{{ $t('message.update') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import BInputGroupFormInput from "../../forms/BInputGroupFormInput";

  export default {
    name: "ProfileEditModal",
    components: {
      BInputGroupFormInput
    },
    data: () => {
      return {
        username: null,
        fullname: null,
        email: null
      }
    },
    methods: {
      getSelf: function() {
        const url = `${this.$api.BASE_URL}/${this.$api.URL_USER_SELF}`;
        this.axios.get(url).then((result) => {
          this.username = result.data.username;
          this.fullname = result.data.fullname;
          this.email = result.data.email;
        });
      },
      updateUser: function() {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_USER_MANAGED}`;
        this.axios.post(url,{
          username: this.username,
          fullname: this.fullname,
          email: this.email
        }).then((response) => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('message.profile_updated'));
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
        this.$root.$emit('bv::hide::modal', 'profileEditModal');
      },
      resetValues: function () {
        this.username = null;
        this.fullname = null;
        this.email = null;
      }
    }
  }
</script>
