<template>
  <div>
    <b-row class="expanded-row">
      <b-col sm="6">
        <b-input-group-form-input
          id="input-license-group-name"
          :label="$t('message.name')"
          input-group-size="mb-3"
          required="true"
          type="text"
          v-model="name"
          lazy="true"
          autofocus="true"
          @keyup="debouncedUpdateLicenseGroup"
        />
      </b-col>
      <b-col sm="6"> </b-col>
    </b-row>
    <b-row class="expanded-row">
      <b-col sm="12">
        <b-form-group>
          <div>
            <div class="fw-bold mb-2">
              <b-row>
                <b-col md="8">{{ $t('message.name') }}</b-col>
                <b-col md="3">{{ $t('message.spdx_license_id') }}</b-col>
                <b-col md="1"></b-col>
              </b-row>
            </div>
            <div v-for="license in licenses" :key="license.uuid" class="mb-2">
              <b-row class="align-items-center">
                <b-col md="8" class="d-flex align-items-center">{{
                  license.name
                }}</b-col>
                <b-col md="3" class="d-flex align-items-center text-muted">
                  <a
                    v-if="license.licenseId"
                    :href="'/licenses/' + encodeURIComponent(license.licenseId)"
                  >
                    {{ license.licenseId }}
                  </a>
                  <span v-else>-</span>
                </b-col>
                <b-col
                  md="1"
                  class="d-flex align-items-center justify-content-end"
                >
                  <b-button
                    size="sm"
                    variant="outline-danger"
                    @click="removeLicense(license)"
                  >
                    <span class="fa fa-trash"></span>
                  </b-button>
                </b-col>
              </b-row>
            </div>
            <div>
              <actionable-list-group-item
                :add-icon="true"
                v-on:actionClicked="showSelectLicenseModal = true"
              />
            </div>
          </div>
        </b-form-group>
        <div style="text-align: right">
          <b-button variant="outline-danger" @click="deleteLicenseGroup">{{
            $t('message.delete_license_group')
          }}</b-button>
        </div>
      </b-col>
    </b-row>
    <select-license-modal
      v-model="showSelectLicenseModal"
      v-on:selection="updateLicenseSelection"
    />
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import permissionsMixin from '../../mixins/permissionsMixin';
import ActionableListGroupItem from '../components/ActionableListGroupItem.vue';
import EventBus from '../../shared/eventbus';
import SelectLicenseModal from './SelectLicenseModal.vue';
import BInputGroupFormInput from '../../forms/BInputGroupFormInput.vue';

export default {
  props: {
    row: Object,
    index: Number,
  },
  mixins: [permissionsMixin],
  components: {
    ActionableListGroupItem,
    BInputGroupFormInput,
    SelectLicenseModal,
  },
  data() {
    return {
      showSelectLicenseModal: false,
      licenseGroup: this.row,
      name: this.row.name,
      licenses: this.row.licenses,
    };
  },
  created() {
    this.debouncedUpdateLicenseGroup = debounce(this.updateLicenseGroup, 750);
  },
  methods: {
    updateLicenseGroup: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}`;
      this.axios
        .post(url, {
          uuid: this.licenseGroup.uuid,
          name: this.name,
        })
        .then((response) => {
          this.licenseGroup = response.data;
          EventBus.emit(
            'policyManagement:licenseGroups:rowUpdate',
            this.index,
            this.licenseGroup,
          );
          this.$toastr.s(this.$t('message.updated'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    deleteLicenseGroup: async function () {
      if (
        !(await this.$confirmDelete({
          title: this.$t('message.delete_license_group'),
        }))
      )
        return;
      let url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}/${this.licenseGroup.uuid}`;
      this.axios
        .delete(url)
        .then(() => {
          EventBus.emit(
            'policyManagement:licenseGroups:rowDeleted',
            this.index,
          );
          this.$toastr.s(this.$t('message.license_group_deleted'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    removeLicense: function (license) {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}/${this.licenseGroup.uuid}/license/${license.uuid}`;
      this.axios
        .delete(url)
        .then((response) => {
          this.syncVariables(response.data);
          this.$toastr.s(this.$t('message.updated'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    updateLicenseSelection: function (selections) {
      this.showSelectLicenseModal = false;
      for (let i = 0; i < selections.length; i++) {
        let selection = selections[i];
        let url = `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}/${this.licenseGroup.uuid}/license/${selection.uuid}`;
        this.axios
          .post(url)
          .then((response) => {
            this.syncVariables(response.data);
            this.$toastr.s(this.$t('message.updated'));
          })
          .catch((error) => {
            if (error.response.status === 304) {
              //this.$toastr.w(this.$t('condition.unsuccessful_action'));
            } else {
              this.$toastr.w(this.$t('condition.unsuccessful_action'));
            }
          });
      }
    },
    syncVariables: function (licenseGroup) {
      this.licenseGroup = licenseGroup;
      this.name = licenseGroup.name;
      this.licenses = licenseGroup.licenses;
    },
  },
};
</script>
