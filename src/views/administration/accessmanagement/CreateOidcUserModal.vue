<template>
  <b-modal
    v-model="visible"
    @hide="resetValues()"
    no-stacking
    :title="$t('admin.create_oidc_user')"
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

    <template v-slot:footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button
        variant="primary"
        :disabled="!(username?.length > 0)"
        @click="createUser()"
        >{{ $t('message.create') }}</b-button
      >
    </template>
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
      username: null,
    };
  },
  methods: {
    createUser: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_USER_OIDC}`;
      this.axios
        .put(url, {
          username: this.username,
        })
        .then(() => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.user_created'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      this.visible = false;
      this.resetValues();
    },
    resetValues: function () {
      this.username = null;
    },
  },
};
</script>
