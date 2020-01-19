<template>
  <b-card no-body :header="header">
    <b-card-body>
      <p>
        {{ $t('admin.internal_component_desc') }}
      </p>
      <b-validated-input-group-form-input
        id="internalComponentsConfigGroupsRegex"
        :label="$t('admin.namespace_regex')"
        input-group-size="mb-3"
        type="text"
        v-model="namespaceRegex"
        :tooltip="$t('admin.namespace_regex_desc')"
      />
      <b-validated-input-group-form-input
        id="internalComponentsConfigNamesRegex"
        :label="$t('admin.name_regex')"
        input-group-size="mb-3"
        type="text"
        v-model="nameRegex"
        :tooltip="$t('admin.name_regex_desc')"
      />
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveChanges">{{ $t('message.update') }}</b-button>
      <b-button variant="outline-primary" class="px-4" @click="identifyInternalComponents">{{ $t('admin.perform_identification') }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
  import { ValidationObserver } from 'vee-validate';
  import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput'
  import configPropertyMixin from "../mixins/configPropertyMixin";

  export default {
    mixins: [configPropertyMixin],
    props: {
      header: String
    },
    components: {
      ValidationObserver,
      BValidatedInputGroupFormInput
    },
    data() {
      return {
        namespaceRegex: "",
        nameRegex: "",
      }
    },
    methods: {
      saveChanges: function() {
        this.updateConfigProperties([
          {groupName: 'internal-components', propertyName: 'groups.regex', propertyValue: this.namespaceRegex},
          {groupName: 'internal-components', propertyName: 'names.regex', propertyValue: this.nameRegex}
        ]);
      },
      identifyInternalComponents: function() {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/internal/identify`;
        this.axios.get(this.configUrl).then((response) => {
          this.$toastr.s(this.$t('admin.internal_identification_queued'));
        }).catch((error) => {
          this.$toastr.s(this.$t('admin.internal_identification_error'));
        });
      }
    },
    created () {
      this.axios.get(this.configUrl).then((response) => {
        let configItems = response.data.filter(function (item) { return item.groupName === "internal-components" });
        for (let i=0; i<configItems.length; i++) {
          let item = configItems[i];
          switch (item.propertyName) {
            case "groups.regex":
              this.namespaceRegex = item.propertyValue; break;
            case "names.regex":
              this.nameRegex = item.propertyValue; break;
          }
        }
      });
    }
  }
</script>
