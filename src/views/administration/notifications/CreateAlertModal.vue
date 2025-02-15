<template>
  <b-modal
    id="createAlertModal"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('admin.create_alert')"
  >
    <b-form-group
      id="fieldset-1"
      :label="this.$t('message.name')"
      label-for="input-1"
      label-class="required"
    >
      <b-form-input
        id="input-1"
        v-model="name"
        class="required"
        required
        trim
      />
    </b-form-group>
    <b-form-group
      id="fieldset-2"
      :label="this.$t('admin.scope')"
      label-for="input-2"
    >
      <b-form-select
        id="input-2"
        v-model="scope"
        :options="availableScopes"
        required
      ></b-form-select>
    </b-form-group>
    <b-form-group
      id="fieldset-3"
      :label="this.$t('admin.notification_level')"
      label-for="input-3"
    >
      <b-form-select
        id="input-3"
        v-model="notificationLevel"
        :options="availableLevels"
        required
      ></b-form-select>
    </b-form-group>
    <b-form-group
      id="fieldset-4"
      :label="this.$t('admin.publisher')"
      label-for="input-4"
      label-class="required"
    >
      <b-form-select
        id="input-4"
        v-model="publisher"
        :options="availablePublishers"
        required
      ></b-form-select>
    </b-form-group>
    <b-form-group :label="$t('admin.alert_trigger_type')">
      <b-form-radio-group
        v-model="triggerType"
        :options="[
          { text: $t('admin.alert_trigger_type_event'), value: 'EVENT' },
          { text: $t('admin.alert_trigger_type_schedule'), value: 'SCHEDULE' },
        ]"
        name="radios-btn-default"
        button-variant="outline-primary"
        buttons
      />
    </b-form-group>
    <template #modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button size="md" variant="primary" @click="createAlert()">{{
        $t('message.create')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import permissionsMixin from '@/mixins/permissionsMixin';
import {
  BButton,
  BFormGroup,
  BFormInput,
  BFormRadioGroup,
  BFormSelect,
  BModal,
} from 'bootstrap-vue';

export default {
  components: {
    BModal,
    BFormGroup,
    BFormInput,
    BFormSelect,
    BFormRadioGroup,
    BButton,
  },
  mixins: [permissionsMixin],
  data() {
    return {
      name: null,
      scope: 'PORTFOLIO',
      notificationLevel: 'INFORMATIONAL',
      publisher: null,
      triggerType: 'EVENT',
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      availableScopes: [
        { value: 'PORTFOLIO', text: 'Portfolio' },
        { value: 'SYSTEM', text: 'System' },
      ],
      availableLevels: [
        { value: 'INFORMATIONAL', text: 'Informational', selected: true },
        { value: 'WARNING', text: 'Warning' },
        { value: 'ERROR', text: 'Error' },
      ],
      availablePublishers: [],
    };
  },
  created() {
    this.axios
      .get(`${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_PUBLISHER}`)
      .then((result) => {
        for (let i = 0; i < result.data.length; i++) {
          this.availablePublishers.push({
            value: result.data[i].uuid,
            text: result.data[i].name,
          });
        }
      });
  },
  methods: {
    createAlert: function () {
      this.$root.$emit('bv::hide::modal', 'createAlertModal');
      let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_RULE}`;
      if (this.triggerType === 'SCHEDULE') {
        url = `${url}/scheduled`;
      }
      this.axios
        .put(url, {
          name: this.name,
          scope: this.scope,
          notificationLevel: this.notificationLevel,
          publisher: { uuid: this.publisher },
        })
        .then(() => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.alert_created'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      this.resetValues();
    },
    resetValues: function () {
      this.name = null;
      this.scope = 'PORTFOLIO';
      this.notificationLevel = 'INFORMATIONAL';
      this.publisher = null;
      this.triggerType = 'EVENT';
    },
  },
};
</script>
