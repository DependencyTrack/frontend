<template>
  <b-modal
    v-model="visible"
    @show="getSelf"
    @hidden="resetValues"
    no-stacking
    :title="$t('message.profile_update')"
  >
    <b-input-group-form-input
      id="fullname-input"
      input-group-size="mb-3"
      type="text"
      v-model="fullname"
      lazy="true"
      required="true"
      feedback="true"
      autofocus="false"
      :label="$t('message.fullname')"
      :feedback-text="$t('admin.required_fullname')"
    />
    <b-input-group-form-input
      id="email-input"
      input-group-size="mb-3"
      type="text"
      v-model="email"
      lazy="true"
      required="true"
      feedback="true"
      autofocus="false"
      :label="$t('message.email')"
      :feedback-text="$t('admin.required_email')"
    />

    <template v-slot:footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button variant="primary" @click="updateUser()">{{
        $t('message.update')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import BInputGroupFormInput from '../../forms/BInputGroupFormInput.vue';
import state from '@/shared/state';
import modalMixin from '@/mixins/modalMixin';

export default {
  name: 'ProfileEditModal',
  mixins: [modalMixin],
  components: {
    BInputGroupFormInput,
  },
  emits: ['refreshTable'],
  data: () => {
    return {
      username: null,
      fullname: null,
      email: null,
    };
  },
  methods: {
    getSelf: function () {
      this.username = state.currentUser.username;
      this.fullname = state.currentUser.fullname;
      this.email = state.currentUser.email;
    },
    updateUser: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_USER_SELF}`;
      this.axios
        .post(url, {
          username: this.username,
          fullname: this.fullname,
          email: this.email,
        })
        .then(() =>
          this.axios.get(`${this.$api.BASE_URL}/${this.$api.URL_USER_SELF}`),
        )
        .then((response) => {
          state.currentUser = response.data;
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('message.profile_updated'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      this.visible = false;
    },
    resetValues: function () {
      this.username = null;
      this.fullname = null;
      this.email = null;
    },
  },
};
</script>
