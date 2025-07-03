<template>
  <b-card no-body :header="header">
    <b-card-body>
      <p>
        {{ $t('admin.jira_desc') }}
      </p>
      <b-validated-input-group-form-input
        id="jira-url"
        :label="$t('admin.jira_url')"
        input-group-size="mb-3"
        rules="required"
        type="text"
        v-model="jiraUrl"
        lazy="true"
      />
      <c-switch
        id="jiraAuthWithTokenEnabled"
        color="primary"
        v-model="enabled"
        label
        v-bind="labelIcon"
      />{{ $t('admin.bearer_token_auth_enable') }}
      <b-validated-input-group-form-input
        id="jira-username"
        :label="$t('admin.jira_username')"
        input-group-size="mb-3"
        rules="required"
        type="text"
        v-model="jiraUsername"
        lazy="true"
        v-if="!enabled"
      />
      <b-validated-input-group-form-input
        id="jira-password"
        :label="$t('admin.jira_password')"
        input-group-size="mb-3"
        type="password"
        v-model="jiraPassword"
        lazy="true"
        conceal="true"
        v-if="!enabled"
      />
      <b-validated-input-group-form-input
        id="jira-token"
        :label="$t('admin.jira_auth_with_token')"
        input-group-size="mb-3"
        type="password"
        v-model="jiraPassword"
        lazy="true"
        conceal="true"
        v-if="enabled"
      />
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveChanges">{{
        $t('message.update')
      }}</b-button>
    </b-card-footer>
  </b-card>
</template>
<script>
import BValidatedInputGroupFormInput from '@/forms/BValidatedInputGroupFormInput';
import configPropertyMixin from '@/views/administration/mixins/configPropertyMixin';
import { Switch as cSwitch } from '@coreui/vue';
import { BButton, BCard, BCardBody, BCardFooter } from 'bootstrap-vue';

export default {
  components: {
    cSwitch,
    BValidatedInputGroupFormInput,
    BCard,
    BCardBody,
    BCardFooter,
    BButton,
  },
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  data() {
    return {
      enabled: false,
      jiraUrl: '',
      jiraUsername: '',
      jiraPassword: '',
    };
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      const configItems = response.data.filter(function (item) {
        return item.groupName === 'integrations';
      });
      for (let i = 0; i < configItems.length; i++) {
        const item = configItems[i];
        switch (item.propertyName) {
          case 'jira.url':
            this.jiraUrl = item.propertyValue;
            break;
          case 'jira.username':
            this.jiraUsername = item.propertyValue;
            this.enabled = this.jiraUsername === undefined;
            break;
          case 'jira.password':
            this.jiraPassword = item.propertyValue;
            break;
        }
      }
    });
  },
  methods: {
    saveChanges: function () {
      if (this.enabled) {
        this.jiraUsername = '';
      }

      this.updateConfigProperties([
        {
          groupName: 'integrations',
          propertyName: 'jira.url',
          propertyValue: this.jiraUrl,
        },
        {
          groupName: 'integrations',
          propertyName: 'jira.username',
          propertyValue: this.jiraUsername,
        },
      ]);
      if (this.jiraPassword !== 'HiddenDecryptedPropertyPlaceholder') {
        this.updateConfigProperty(
          'integrations',
          'jira.password',
          this.jiraPassword,
        );
      }
    },
  },
};
</script>
