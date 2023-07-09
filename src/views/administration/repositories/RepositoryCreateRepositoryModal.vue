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
      <CSwitch color="primary" :checked.sync="internal" label />{{$t('admin.internal')}}
    </div>

    <b-validated-input-group-form-input
          id="username"
          :label="$t('admin.username')"
          input-group-size="mb-3"
          v-model="username"
          v-show="internal"
      />

      <b-validated-input-group-form-input
          id="password"
          :label="$t('admin.password')"
          input-group-size="mb-3"
          v-model="password"
          v-show="internal"
      />

    <div>
      <CSwitch color="primary" :checked.sync="enabled" label />{{$t('admin.enabled')}}
    </div>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.close') }}</b-button>
      <b-button size="md" variant="primary" @click="createRepository()">{{ $t('message.create') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import { CSwitch } from '@coreui/vue';
  import BInputGroupFormSelect from "../../../forms/BInputGroupFormSelect";
  import BValidatedInputGroupFormInput from "../../../forms/BValidatedInputGroupFormInput";

  export default {
    name: "RepositoryCreateRepositoryModal",
    props: {
      type: String
    },
    components: {
      CSwitch,
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
        username: null,
        password: null,
        enabled: true,
        repositoryTypes: [
          { value: 'COMPOSER', text: 'PHP (Composer)' },
          { value: 'CPAN', text: 'Perl (CPAN)' },
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
          username: this.username,
          password: this.password || null,
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
        this.username = null;
        this.password = null;
        this.enabled = true;
      }
    }
  }
</script>
