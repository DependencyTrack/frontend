<template>
  <b-modal
    id="createScheduledAlertModal"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('admin.create_scheduled_alert')"
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
    <template v-slot:modal-footer="{ cancel }">
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
import permissionsMixin from '../../../mixins/permissionsMixin';
import axios from 'axios';

export default {
  mixins: [permissionsMixin],
  data() {
    return {
      name: null,
      scope: 'PORTFOLIO',
      notificationLevel: 'INFORMATIONAL',
      publisher: null,
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      availableScopes: [
        { value: 'PORTFOLIO', text: 'Portfolio' },
        { value: 'SYSTEM', text: 'System' },
      ],
      availablePublishers: [],
    };
  },
  created() {
    axios
      .get(
        `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_PUBLISHER_SCHEDULED}`,
      )
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
      this.$root.$emit('bv::hide::modal', 'createScheduledAlertModal');
      let url = `${this.$api.BASE_URL}/${this.$api.URL_SCHEDULED_NOTIFICATION_RULE}`;
      this.axios
        .put(url, {
          name: this.name,
          scope: this.scope,
          notificationLevel: this.notificationLevel,
          publisher: { uuid: this.publisher },
        })
        .then(() => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.scheduled_alert_created'));
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
    },
  },
};
</script>
