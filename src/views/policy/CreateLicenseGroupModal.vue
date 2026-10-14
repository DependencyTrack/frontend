<template>
  <b-modal
    v-model="visible"
    @hide="resetValues()"
    no-stacking
    :title="$t('message.create_license_group')"
  >
    <b-validated-input-group-form-input
      id="identifier"
      :label="this.$t('message.name')"
      input-group-size="mb-3"
      required
      v-model="name"
    />

    <template v-slot:footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button variant="primary" @click="createLicenseGroup()">{{
        $t('message.create')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import permissionsMixin from '../../mixins/permissionsMixin';
import modalMixin from '@/mixins/modalMixin';
import BValidatedInputGroupFormInput from '../../forms/BValidatedInputGroupFormInput.vue';

export default {
  name: 'createLicenseGroupModal',
  mixins: [permissionsMixin, modalMixin],
  components: {
    BValidatedInputGroupFormInput,
  },
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
        .then(() => {
          this.$emit('refreshTable');
          this.visible = false;
          this.$toastr.s(this.$t('message.license_group_created'));
        })
        .catch(() => {
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
