<template>
  <b-modal
    id="licenseAddLicenseModal"
    @hide="resetValues()"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('message.add_license')"
  >
    <b-tabs class="body-bg-color" style="border: 0; padding: 0">
      <b-tab class="body-bg-color" style="border: 0; padding: 0" active>
        <template v-slot:title
          ><i class="fa fa-edit"></i> {{ $t('message.general') }}</template
        >
        <b-card>
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
          <c-switch
            id="input-5"
            class="mx-1"
            color="primary"
            v-model="license.isOsiApproved"
            label
            v-bind="labelIcon"
          ></c-switch>
          {{ $t('message.osi_approved') }} <br />
          <c-switch
            id="input-5"
            class="mx-1"
            color="primary"
            v-model="license.isFsfLibre"
            label
            v-bind="labelIcon"
          ></c-switch>
          {{ $t('message.fsf_libre') }} <br />
          <c-switch
            id="input-5"
            class="mx-1"
            color="primary"
            v-model="license.isDeprecatedLicenseId"
            label
            v-bind="labelIcon"
          ></c-switch>
          {{ $t('message.deprecated') }}
        </b-card>
      </b-tab>
      <b-tab>
        <template v-slot:title
          ><i class="fa fa-newspaper-o"></i>
          {{ $t('message.extended') }}</template
        >
        <b-card>
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
        </b-card>
      </b-tab>
    </b-tabs>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button size="md" variant="primary" @click="addLicense()">{{
        $t('message.create')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import BInputGroupFormInput from '@/forms/BInputGroupFormInput';
import { Switch as cSwitch } from '@coreui/vue';

export default {
  name: 'LicenseAddLicenseModal',
  components: {
    BInputGroupFormInput,
    cSwitch,
  },
  data() {
    return {
      license: {},
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
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
        .then((response) => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('message.project_created'));
        })
        .catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        })
        .finally(() => {
          this.$root.$emit('bv::hide::modal', 'licenseAddLicenseModal');
        });
    },
    resetValues: function () {
      this.license = {};
    },
  },
};
</script>

<style scoped>
.tab-content .tab-pane {
  padding: 0 !important;
}
.tab-content {
  border: 0 !important;
}
.card {
  border: 0;
  padding: 0;
  margin-bottom: 0;
}
</style>
