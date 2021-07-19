<template>
  <b-modal id="repositoryCreateRepositoryModal" @hide="resetValues()" size="md" hide-header-close no-stacking :title="$t('admin.create_repository')">
    <b-validated-input-group-form-input
      id="identifier"
      :label="$t('admin.identifier')"
      input-group-size="mb-3"
      rules="required"
      v-model="identifier"
    />
    <b-validated-input-group-form-input
      id="url"
      :label="$t('admin.url')"
      input-group-size="mb-3"
      rules="required"
      type="url"
      v-model="url"
    />
    <b-input-group-form-select id="input-repository-type" required="true"
                               v-model="repositoryType" :options="repositoryTypes"
                               :label="$t('admin.repository_type')" />
    <div>
      <c-switch color="primary" v-model="internal" label v-bind="labelIcon" />{{$t('admin.internal')}}
    </div>
    <div>
      <c-switch color="primary" v-model="enabled" label v-bind="labelIcon" />{{$t('admin.enabled')}}
    </div>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.close') }}</b-button>
      <b-button size="md" variant="primary" @click="createRepository()">{{ $t('message.create') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import { Switch as cSwitch } from '@coreui/vue';
  import BInputGroupFormSelect from "../../../forms/BInputGroupFormSelect";
  import BValidatedInputGroupFormInput from "../../../forms/BValidatedInputGroupFormInput";

  export default {
    name: "RepositoryCreateRepositoryModal",
    props: {
      type: String
    },
    components: {
      cSwitch,
      BInputGroupFormSelect,
      BValidatedInputGroupFormInput
    },
    created() {
      this.initialRepositoryType = this.type;
      this.repositoryType = this.type;
    },
    data() {
      return {
        identifier: null,
        url: null,
        repositoryType: null,
        initialRepositoryType: null,
        internal: false,
        enabled: true,
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        },
        repositoryTypes: [
          { value: 'COMPOSER', text: 'PHP (Composer)' },
          { value: 'GEM', text: 'Ruby (Gem)' },
          { value: 'GO_MODULES', text: 'Go Modules'},
          { value: 'CARGO', text: 'Rust (Cargo)' },
          { value: 'HEX', text: 'Erlang/Elixir (Hex)' },
          { value: 'MAVEN', text: 'Java (Maven)' },
          { value: 'NPM', text: 'Javascript (NPM)' },
          { value: 'NUGET', text: '.NET (NuGet)' },
          { value: 'PYPI', text: 'Python (Pypi)' }
        ],
      }
    },
    methods: {
      createRepository: function() {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}`;
        this.axios.put(url, {
          type: this.repositoryType,
          identifier: this.identifier,
          url: this.url,
          internal: this.internal,
          enabled: this.enabled
        }).then((response) => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.repository_created'));
          this.$root.$emit('bv::hide::modal', 'repositoryCreateRepositoryModal');
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
          this.$root.$emit('bv::hide::modal', 'repositoryCreateRepositoryModal');
        });
        this.resetValues();
      },
      resetValues: function () {
        this.repositoryType = this.initialRepositoryType;
        this.identifier = null;
        this.url = null;
        this.internal = false;
        this.enabled = true;
      }
    }
  }
</script>
