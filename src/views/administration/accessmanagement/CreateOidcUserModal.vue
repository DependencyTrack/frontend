<template>
  <b-modal
    v-model="visible"
    @hidden="resetValues()"
    no-stacking
    focus="username-input-input"
    :title="$t('admin.create_oidc_user')"
    :ok-title="$t('message.create')"
    :cancel-title="$t('message.close')"
    :ok-disabled="submitting || !(username?.length > 0)"
    :no-close-on-esc="submitting"
    :no-close-on-backdrop="submitting"
    @ok.prevent="createUser()"
  >
    <b-form @submit.prevent="createUser()">
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
    </b-form>
  </b-modal>
</template>

<script>
import permissionsMixin from '../../../mixins/permissionsMixin';
import BInputGroupFormInput from '../../../forms/BInputGroupFormInput.vue';
import modalMixin from '@/mixins/modalMixin';

export default {
  mixins: [permissionsMixin, modalMixin],
  components: {
    BInputGroupFormInput,
  },
  emits: ['refreshTable'],
  data() {
    return {
      submitting: false,
      username: null,
    };
  },
  methods: {
    createUser: function () {
      if (this.submitting) return;
      this.submitting = true;
      let url = `${this.$api.BASE_URL}/${this.$api.URL_USER_OIDC}`;
      this.axios
        .put(url, {
          username: this.username,
        })
        .then(() => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.user_created'));
          this.visible = false;
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        })
        .finally(() => {
          this.submitting = false;
        });
    },
    resetValues: function () {
      this.username = null;
    },
  },
};
</script>
