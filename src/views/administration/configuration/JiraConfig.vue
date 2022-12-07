<template>
  <b-card no-body :header="header">
    <b-card-body>
      <p>
        {{ $t('admin.jira_desc') }}
      </p>
      <b-validated-input-group-form-input
        id="jira-username"
        :label="$t('admin.jira_username')"
        input-group-size="mb-3"
        rules="required"
        type="text"
        v-model="jiraUsername"
        lazy="true"
      />
      <b-validated-input-group-form-input
        id="jira-password"
        :label="$t('admin.jira_password')"
        input-group-size="mb-3"
        type="password"
        v-model="jiraPassword"
        lazy="true"
        conceal="true"
      />
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveChanges">{{ $t('message.update') }}</b-button>
    </b-card-footer>
  </b-card>
</template>
<script>
import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput'
import configPropertyMixin from "../mixins/configPropertyMixin";
export default {
  mixins: [configPropertyMixin],
  props: {
    header: String
  },
  components: {
    BValidatedInputGroupFormInput
  },
  data() {
    return {
      jiraUsername: "",
      jiraPassword: "",
    }
  },
  methods: {
    saveChanges: function() {
      this.updateConfigProperties([
        {groupName: 'jira', propertyName: 'jira.username', propertyValue: this.jiraUsername}
      ]);
      if (this.jiraPassword !== "HiddenDecryptedPropertyPlaceholder") {
        this.updateConfigProperty("jira", "jira.password", this.jiraPassword);
      }
    }
  },
  created () {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) { return item.groupName === "jira" });
      for (let i=0; i<configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case "jira.username":
            this.jiraUsername = item.propertyValue; break;
          case "jira.password":
            this.jiraPassword = item.propertyValue; break;
        }
      }
    });
  }
}
</script>
