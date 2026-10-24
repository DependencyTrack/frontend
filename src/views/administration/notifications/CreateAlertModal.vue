<template>
  <b-modal
    v-model="visible"
    no-stacking
    focus="input-1"
    :title="$t('admin.create_alert')"
    :ok-title="$t('message.create')"
    :cancel-title="$t('message.close')"
    :ok-disabled="submitting"
    :no-close-on-esc="submitting"
    :no-close-on-backdrop="submitting"
    @ok.prevent="createAlert()"
  >
    <b-form @submit.prevent="createAlert()">
      <b-form-group
        id="fieldset-1"
        :label="this.$t('message.name')"
        label-for="input-1"
        label-class="required"
      >
        <b-form-input
          id="input-1"
          v-model.trim="name"
          class="required"
          required
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
            {
              text: $t('admin.alert_trigger_type_schedule'),
              value: 'SCHEDULE',
            },
          ]"
          button-variant="outline-primary"
          buttons
        />
      </b-form-group>
      <button type="submit" style="display: none" />
    </b-form>
  </b-modal>
</template>

<script>
import permissionsMixin from '../../../mixins/permissionsMixin';
import axios from 'axios';
import modalMixin from '@/mixins/modalMixin';

export default {
  mixins: [permissionsMixin, modalMixin],
  emits: ['refreshTable'],
  data() {
    return {
      submitting: false,
      name: null,
      scope: 'PORTFOLIO',
      notificationLevel: 'INFORMATIONAL',
      publisher: null,
      triggerType: 'EVENT',
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
    axios
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
      if (this.submitting) return;
      this.submitting = true;
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
          this.visible = false;
          this.resetValues();
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
      this.scope = 'PORTFOLIO';
      this.notificationLevel = 'INFORMATIONAL';
      this.publisher = null;
      this.triggerType = 'EVENT';
    },
  },
};
</script>
