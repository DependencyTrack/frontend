<template>
  <b-modal
    v-model="visible"
    @hidden="resetValues()"
    no-stacking
    focus="name-input-input"
    :title="$t('admin.create_saml_group')"
    :ok-title="$t('message.create')"
    :cancel-title="$t('message.close')"
    :ok-disabled="submitting || !(name?.length > 0)"
    :no-close-on-esc="submitting"
    :no-close-on-backdrop="submitting"
    @ok.prevent="createGroup()"
  >
    <b-form @submit.prevent="createGroup()">
      <b-input-group-form-input
        id="name-input"
        input-group-size="mb-3"
        type="text"
        v-model="name"
        lazy="true"
        required="true"
        feedback="true"
        autofocus="false"
        :label="$t('admin.saml_group_name')"
        :feedback-text="$t('admin.required_saml_group_name')"
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
      name: null,
    };
  },
  methods: {
    createGroup: function () {
      if (this.submitting) return;
      this.submitting = true;
      const url = `${this.$api.BASE_URL}/${this.$api.URL_SAML_GROUP}`;
      this.axios
        .post(url, { name: this.name })
        .then(() => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.saml_group_created'));
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
      this.name = null;
    },
  },
};
</script>
