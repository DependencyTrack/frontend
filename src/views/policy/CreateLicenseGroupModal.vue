<template>
  <b-modal
    id="createLicenseGroupModal"
    @hide="resetValues()"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('message.create_license_group')"
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
      <b-button size="md" variant="primary" @click="createLicenseGroup()">{{
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
    createLicenseGroup: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}`;
      this.axios
        .put(url, {
          name: this.name,
        })
        .then((response) => {
          this.$emit('refreshTable');
          this.$root.$emit('bv::hide::modal', 'createLicenseGroupModal');
          this.$toastr.s(this.$t('message.license_group_created'));
        })
        .catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      this.resetValues();
    },
    resetValues: function () {
      this.name = null;
    },
  },
};
</script>
