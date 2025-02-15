<template>
  <b-modal
    id="createPolicyModal"
    @hide="resetValues()"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('message.create_policy')"
  >
    <b-validated-input-group-form-input
      id="identifier"
      :label="this.$t('message.name')"
      input-group-size="mb-3"
      rules="required"
      v-model="name"
    />

    <template #modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button size="md" variant="primary" @click="createPolicy()">{{
        $t('message.create')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import permissionsMixin from '@/mixins/permissionsMixin';
import BValidatedInputGroupFormInput from '@/forms/BValidatedInputGroupFormInput';
import { BButton, BModal } from 'bootstrap-vue';

export default {
  components: {
    BValidatedInputGroupFormInput,
    BModal,
    BButton,
  },
  mixins: [permissionsMixin],
  data() {
    return {
      name: null,
    };
  },
  methods: {
    createPolicy: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}`;
      this.axios
        .put(url, {
          name: this.name,
        })
        .then((response) => {
          this.$root.$emit('bv::hide::modal', 'createPolicyModal');
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('message.policy_created'));
        })
        .catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        })
        .finally(() => {
          this.resetValues();
        });
    },
    resetValues: function () {
      this.name = null;
    },
  },
};
</script>
