<template>
  <b-modal
    id="createServiceAccountModal"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('admin.create_service_account')"
    @ok="onOk"
    @hidden="resetValues"
  >
    <b-form @submit.stop.prevent="onSubmit">
      <b-form-group
        :label="$t('message.name')"
        label-class="required"
        label-for="service-account-name-input"
        :description="$t('admin.service_account_name_description')"
        :invalid-feedback="$t('admin.service_account_name_invalid')"
        :state="nameState"
      >
        <b-form-input
          id="service-account-name-input"
          v-model="name"
          maxlength="59"
          type="text"
          autofocus
          required
          trim
          :state="nameState"
        />
      </b-form-group>
      <b-form-group
        :label="$t('message.email')"
        label-for="service-account-email-input"
      >
        <b-form-input
          id="service-account-email-input"
          v-model="email"
          type="email"
          trim
        />
      </b-form-group>
      <button type="submit" style="display: none" />
    </b-form>
    <template v-slot:modal-footer="{ cancel, ok }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button
        size="md"
        variant="primary"
        :disabled="!nameState"
        @click="ok()"
        >{{ $t('message.create') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
const NAME_PATTERN = /^(?![sS][vV][cC]:)[a-zA-Z0-9][a-zA-Z0-9+=,.:@_-]*$/;

export default {
  data() {
    return {
      name: '',
      email: '',
    };
  },
  computed: {
    nameState() {
      if (!this.name) {
        return null;
      }
      return this.name.length <= 59 && NAME_PATTERN.test(this.name);
    },
  },
  methods: {
    onOk(event) {
      event.preventDefault();
      this.onSubmit();
    },
    async onSubmit() {
      if (!this.nameState) {
        return;
      }
      try {
        await this.axios.post(
          `${this.$api.BASE_URL}/${this.$api.URL_SERVICE_ACCOUNT}`,
          { name: this.name, email: this.email || undefined },
        );
        this.$emit('refreshTable');
        this.$toastr.s(this.$t('admin.service_account_created'));
        this.$bvModal.hide('createServiceAccountModal');
      } catch (error) {
        console.error(error);
      }
    },
    resetValues() {
      this.name = '';
      this.email = '';
    },
  },
};
</script>
