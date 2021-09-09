<template>
  <b-card no-body :header="header">
    <b-card-body>
      <c-switch id="enabled" color="primary" v-model="enabled" label v-bind="labelIcon" />{{$t('admin.integration_jira_enable')}}
      <b-validated-input-group-form-input
        id="jira-url"
        :label="$t('admin.jira_url')"
        input-group-size="mb-3"
        rules="required"
        type="url"
        v-model="url"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="jira-username"
        :label="$t('admin.jira_username')"
        input-group-size="mb-3"
        rules="required"
        type="text"
        v-model="username"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="jira-password"
        :label="$t('admin.jira_password')"
        input-group-size="mb-3"
        rules="required"
        type="password"
        v-model="password"
        lazy="true"
        conceal="true"
      />
      <b-validated-input-group-form-input
        id="jira-project"
        :label="$t('admin.jira_project')"
        input-group-size="mb-3"
        rules="required"
        type="text"
        v-model="project"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="jira-issuetype"
        :label="$t('admin.jira_issuetype')"
        input-group-size="mb-3"
        rules="required"
        type="text"
        v-model="issuetype"
        lazy="true"
      />
    </b-card-body>
    <b-card-footer>
      <b-button size="md" class="px-4" variant="outline-primary" @click="saveChanges">{{ $t('message.update') }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
  import { Switch as cSwitch } from '@coreui/vue';
  import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput';
  import configPropertyMixin from "../mixins/configPropertyMixin";
  import common from "../../../shared/common";

  export default {
    mixins: [configPropertyMixin],
    props: {
      header: String
    },
    components: {
      cSwitch,
      BValidatedInputGroupFormInput,
    },
    data() {
      return {
        enabled: false,
        url: '',
        username: '',
        password: '',
        project: '',
        issuetype: ''
      }
    },
    methods: {
      saveChanges: function() {
        this.updateConfigProperties([
          {groupName: 'integrations', propertyName: 'jira.enabled', propertyValue: this.enabled},
          {groupName: 'integrations', propertyName: 'jira.url', propertyValue: this.url},
          {groupName: 'integrations', propertyName: 'jira.username', propertyValue: this.username},
          {groupName: 'integrations', propertyName: 'jira.project', propertyValue: this.project},
          {groupName: 'integrations', propertyName: 'jira.issuetype', propertyValue: this.issuetype},
        ]);
        if (this.password !== "HiddenDecryptedPropertyPlaceholder") {
          this.updateConfigProperty("integrations", "jira.password", this.password);
        }
      }
    },
    created () {
      this.axios.get(this.configUrl).then((response) => {
        let configItems = response.data.filter(function (item) { return item.groupName === "integrations" });
        for (let i=0; i<configItems.length; i++) {
          let item = configItems[i];
          switch (item.propertyName) {
            case "jira.enabled":
              this.enabled = common.toBoolean(item.propertyValue); break;
            case "jira.url":
              this.url = item.propertyValue; break;
            case "jira.project":
              this.project = item.propertyValue; break;
            case "jira.issuetype":
              this.issuetype = item.propertyValue; break;
            case "jira.username":
              this.username = item.propertyValue; break;
            case "jira.password":
              this.password = item.propertyValue; break; // "HiddenDecryptedPropertyPlaceholder"
          }
        }
      });
    }
  }
</script>
