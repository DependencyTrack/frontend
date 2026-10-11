<template>
  <b-row class="expanded-row">
    <b-col sm="12">
      <b-form @submit.prevent="updateRepository" style="max-width: 40rem">
        <b-validated-input-group-form-input
          id="url"
          :label="$t('admin.url')"
          input-group-size="mb-3"
          required
          type="url"
          v-model="url"
          autofocus="true"
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
          <b-form-checkbox v-model="authenticationRequired" switch>{{
            $t('admin.repository_authentication')
          }}</b-form-checkbox>
        </div>
        <div v-if="authenticationRequired" class="ml-4">
          <b-validated-input-group-form-input
            id="username"
            :label="$t('admin.username')"
            input-group-size="mb-3"
            v-model="username"
          />
          <div class="mb-3">
            <label for="password"
              >{{ $t('admin.password') }}
              <i
                class="fa fa-key text-warning ml-1"
                :title="$t('admin.secret_reference_field')"
              ></i
            ></label>
            <secret-ref-select id="password" v-model="password" />
          </div>
        </div>
        <div class="d-flex justify-content-end mt-3">
          <b-button type="submit" variant="primary" class="mr-2">{{
            $t('message.update')
          }}</b-button>
          <b-button variant="outline-danger" @click="deleteRepository">{{
            $t('message.delete')
          }}</b-button>
        </div>
      </b-form>
    </b-col>
  </b-row>
</template>

<script>
import BValidatedInputGroupFormInput from '../../../forms/BValidatedInputGroupFormInput.vue';
import SecretRefSelect from '../../components/SecretRefSelect.vue';
import EventBus from '../../../shared/eventbus';

export default {
  props: {
    row: Object,
    index: Number,
  },
  components: {
    BValidatedInputGroupFormInput,
    SecretRefSelect,
  },
  data() {
    return {
      repository: this.row,
      identifier: this.row.identifier,
      url: this.row.url,
      internal: this.row.internal,
      authenticationRequired: this.row.authenticationRequired,
      username: this.row.username,
      password: this.row.password,
      enabled: this.row.enabled,
      uuid: this.row.uuid,
    };
  },
  methods: {
    deleteRepository: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}/${this.uuid}`;
      this.axios
        .delete(url)
        .then(() => {
          EventBus.emit('admin:repository:rowDeleted', this.index);
          this.$toastr.s(this.$t('admin.repository_deleted'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    updateRepository: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_REPOSITORY}`;
      this.axios
        .post(url, {
          identifier: this.identifier,
          url: this.url,
          internal: this.internal,
          authenticationRequired: this.authenticationRequired,
          username: this.username,
          password: this.password,
          enabled: this.enabled,
          uuid: this.uuid,
        })
        .then((response) => {
          this.repository = response.data;
          EventBus.emit(
            'admin:repository:rowUpdate',
            this.index,
            this.repository,
          );
          this.$toastr.s(this.$t('message.updated'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
  },
};
</script>
