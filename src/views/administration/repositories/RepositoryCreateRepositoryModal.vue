<template>
  <b-modal
    v-model="visible"
    @hide="resetValues()"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('admin.create_repository')"
  >
    <b-form id="createRepositoryForm" @submit.prevent="createRepository">
      <b-validated-input-group-form-input
        id="identifier"
        :label="$t('admin.identifier')"
        input-group-size="mb-3"
        required
        v-model="identifier"
      />
      <b-validated-input-group-form-input
        id="url"
        :label="$t('admin.url')"
        input-group-size="mb-3"
        required
        type="url"
        v-model="url"
      />
      <b-input-group-form-select
        id="input-repository-type"
        required="true"
        v-model="repositoryType"
        :options="repositoryTypes"
        :label="$t('admin.repository_type')"
      />
      <div class="mb-3">
        <b-form-checkbox v-model="enabled" switch>{{
          $t('admin.enabled')
        }}</b-form-checkbox>
      </div>
      <div class="mb-3">
        <b-form-checkbox v-model="internal" switch>{{
          $t('admin.internal')
        }}</b-form-checkbox>
      </div>
      <div class="mb-3">
        <b-form-checkbox v-model="repository_authentication" switch>{{
          $t('admin.repository_authentication')
        }}</b-form-checkbox>
      </div>
      <div v-if="repository_authentication" class="ms-4">
        <b-validated-input-group-form-input
          id="username"
          :label="$t('admin.username')"
          input-group-size="mb-3"
          v-model="username"
        />
        <div class="mb-3">
          <label for="password">{{ $t('admin.password') }}</label>
          <secret-ref-select id="password" v-model="password" />
        </div>
      </div>
    </b-form>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button
        size="md"
        variant="primary"
        type="submit"
        form="createRepositoryForm"
        >{{ $t('message.create') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import BInputGroupFormSelect from '../../../forms/BInputGroupFormSelect.vue';
import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput.vue';
import SecretRefSelect from '../../components/SecretRefSelect.vue';
import modalMixin from '@/mixins/modalMixin';

export default {
  name: 'RepositoryCreateRepositoryModal',
  mixins: [modalMixin],
  compatConfig: { COMPONENT_V_MODEL: false },
  props: {
    type: String,
  },
  components: {
    BInputGroupFormSelect,
    BValidatedInputGroupFormInput,
    SecretRefSelect,
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
      repository_authentication: false,
      username: null,
      password: null,
      enabled: true,
      repositoryTypes: [
        { value: 'COMPOSER', text: 'PHP (Composer)' },
        { value: 'CPAN', text: 'Perl (CPAN)' },
        { value: 'GEM', text: 'Ruby (Gem)' },
        { value: 'GO_MODULES', text: 'Go Modules' },
        { value: 'CARGO', text: 'Rust (Cargo)' },
        { value: 'HEX', text: 'Erlang/Elixir (Hex)' },
        { value: 'MAVEN', text: 'Java (Maven)' },
        { value: 'NPM', text: 'Javascript (NPM)' },
        { value: 'NUGET', text: '.NET (NuGet)' },
        { value: 'PYPI', text: 'Python (Pypi)' },
      ],
    };
  },
  methods: {
    createRepository: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}`;
      this.axios
        .put(url, {
          type: this.repositoryType,
          identifier: this.identifier,
          url: this.url,
          internal: this.internal,
          authenticationRequired: this.repository_authentication,
          username: this.username,
          password: this.password || null,
          enabled: this.enabled,
        })
        .then(() => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.repository_created'));
          this.visible = false;
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
          this.visible = false;
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
      this.repository_authentication = false;
    },
  },
};
</script>
