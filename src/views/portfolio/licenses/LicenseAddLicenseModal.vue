<template>
  <b-modal
    v-model="visible"
    @hide="resetValues()"
    no-stacking
    :title="$t('message.add_license')"
  >
    <b-tabs>
      <b-tab active>
        <template v-slot:title
          ><i class="fa fa-edit"></i> {{ $t('message.general') }}</template
        >
        <b-input-group-form-input
          id="license-name-input"
          input-group-size="mb-3"
          type="text"
          v-model="license.name"
          lazy="true"
          required="true"
          feedback="true"
          autofocus="false"
          :label="$t('message.license_name')"
          :tooltip="this.$t('message.license_name_desc')"
          :feedback-text="$t('message.required_license_name')"
        />
        <b-input-group-form-input
          id="license-id-input"
          input-group-size="mb-3"
          type="text"
          v-model="license.licenseId"
          lazy="true"
          required="true"
          feedback="true"
          autofocus="false"
          :label="$t('message.license_id')"
          :tooltip="this.$t('message.license_id_desc')"
          :feedback-text="$t('message.required_license_id')"
        />
        <b-form-group
          id="license-text-form-group"
          :label="this.$t('message.license_text')"
          label-for="license-text-input"
        >
          <b-form-textarea
            id="license-text-description"
            v-model="license.licenseText"
            rows="3"
          />
        </b-form-group>
        <b-form-checkbox class="mx-1" v-model="license.isOsiApproved" switch>{{
          $t('message.osi_approved')
        }}</b-form-checkbox>
        <b-form-checkbox class="mx-1" v-model="license.isFsfLibre" switch>{{
          $t('message.fsf_libre')
        }}</b-form-checkbox>
        <b-form-checkbox
          class="mx-1"
          v-model="license.isDeprecatedLicenseId"
          switch
          >{{ $t('message.deprecated') }}</b-form-checkbox
        >
      </b-tab>
      <b-tab>
        <template v-slot:title
          ><i class="fa fa-newspaper-o"></i>
          {{ $t('message.extended') }}</template
        >
        <b-form-group
          id="license-comments-form-group"
          :label="this.$t('message.license_comments')"
          label-for="license-comments-input"
        >
          <b-form-textarea
            id="license-comments-description"
            v-model="license.licenseComments"
            rows="3"
          />
        </b-form-group>
        <b-form-group
          id="license-template-form-group"
          :label="this.$t('message.template')"
          label-for="license-template-input"
        >
          <b-form-textarea
            id="license-template-description"
            v-model="license.standardLicenseTemplate"
            rows="3"
          />
        </b-form-group>
        <b-form-group
          id="license-source-header-form-group"
          :label="this.$t('message.source_header')"
          label-for="license-source-header-input"
        >
          <b-form-textarea
            id="license-source-header-description"
            v-model="license.standardLicenseHeader"
            rows="3"
          />
        </b-form-group>
        <b-form-group
          id="license-see-also-form-group"
          :label="this.$t('message.see_also')"
          label-for="license-see-also-input"
        >
          <b-form-textarea
            id="license-see-also-description"
            v-model="license.seeAlso"
            rows="3"
          />
        </b-form-group>
      </b-tab>
    </b-tabs>
    <template v-slot:footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button variant="primary" @click="addLicense()">{{
        $t('message.create')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import BInputGroupFormInput from '@/forms/BInputGroupFormInput.vue';
import modalMixin from '@/mixins/modalMixin';

export default {
  name: 'LicenseAddLicenseModal',
  mixins: [modalMixin],
  components: {
    BInputGroupFormInput,
  },
  emits: ['refreshTable'],
  data() {
    return {
      license: {},
    };
  },
  methods: {
    addLicense: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE}`;
      this.axios
        .put(url, {
          name: this.license.name,
          licenseText: this.license.licenseText,
          standardLicenseTemplate: this.license.standardLicenseTemplate,
          standardLicenseHeader: this.license.standardLicenseHeader,
          licenseComments: this.license.licenseComments,
          licenseId: this.license.licenseId,
          isOsiApproved: this.license.isOsiApproved,
          isFsfLibre: this.license.isFsfLibre,
          isDeprecatedLicenseId: this.license.isDeprecatedLicenseId,
          seeAlso: this.license.seeAlso,
        })
        .then(() => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('message.license_created'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        })
        .finally(() => {
          this.visible = false;
        });
    },
    resetValues: function () {
      this.license = {};
    },
  },
};
</script>

<style scoped>
.card {
  border: 0;
  padding: 0;
  margin-bottom: 0;
}
</style>
