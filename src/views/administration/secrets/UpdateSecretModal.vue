<template>
  <b-modal
    v-model="visible"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('admin.update_secret', { name: name })"
    @ok="onOk"
    @show="onShow"
    @hidden="resetValues"
  >
    <b-form ref="form" @submit.stop.prevent="onSubmit">
      <b-form-group
        :label="$t('message.value')"
        label-for="value-input"
        :invalid-feedback="valueInvalidFeedback"
        :state="!valueInvalidFeedback"
      >
        <b-form-textarea
          id="value-input"
          v-model="value"
          :placeholder="$t('admin.update_secret_value_placeholder')"
          trim
        />
      </b-form-group>

      <b-form-group
        :label="$t('message.description')"
        label-for="description-input"
        :invalid-feedback="descriptionInvalidFeedback"
        :state="!descriptionInvalidFeedback"
      >
        <b-form-input
          id="description-input"
          v-model="description"
          :placeholder="$t('admin.update_secret_description_placeholder')"
          type="text"
        />
      </b-form-group>
      <button type="submit" style="display: none" />
    </b-form>
  </b-modal>
</template>

<script>
import permissionsMixin from '../../../mixins/permissionsMixin';
import modalMixin from '@/mixins/modalMixin';

export default {
  mixins: [permissionsMixin, modalMixin],
  compatConfig: { COMPONENT_V_MODEL: false },
  props: {
    secret: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      name: '',
      description: '',
      descriptionInvalidFeedback: null,
      value: '',
      valueInvalidFeedback: null,
    };
  },
  methods: {
    onShow: function () {
      if (!this.secret) {
        return;
      }
      this.name = this.secret.name;
      this.description = this.secret.description;
      this.value = '';
    },
    onOk: function (event) {
      event.preventDefault();
      this.onSubmit();
    },
    onSubmit: function () {
      const requestBody = {};
      if (this.description !== this.secret.description) {
        requestBody.description = this.description;
      }
      if (this.value) {
        requestBody.value = this.value;
      }

      this.resetValidationFeedback();

      this.axios
        .patch(
          `${this.$api.BASE_URL}/api/v2/secrets/${encodeURIComponent(this.name)}`,
          requestBody,
          {
            validateStatus: function (status) {
              return status === 204 || status === 304;
            },
          },
        )
        .then((response) => {
          if (response.status === 204) {
            this.$toastr.s(
              this.$t('message.record_updated_message'),
              this.$t('message.record_updated_title'),
            );
            this.$emit('refreshTable');
          } else if (response.status === 304) {
            this.$toastr.i(
              this.$t('message.record_unchanged_message'),
              this.$t('message.record_unchanged_title'),
            );
          }

          this.visible = false;
          this.resetValues();
        })
        .catch((err) => {
          if (
            err.response &&
            err.response.status === 400 &&
            err.response.headers['content-type'] ===
              'application/problem+json' &&
            err.response.data.errors
          ) {
            for (const validationErr of err.response.data.errors) {
              switch (validationErr.path.split('.').pop()) {
                case 'description':
                  this.descriptionInvalidFeedback = validationErr.message;
                  break;
                case 'value':
                  this.valueInvalidFeedback = validationErr.message;
                  break;
              }
            }
          }
        });
    },
    resetValidationFeedback: function () {
      this.descriptionInvalidFeedback = null;
      this.valueInvalidFeedback = null;
    },
    resetValues: function () {
      this.name = '';
      this.description = '';
      this.descriptionInvalidFeedback = null;
      this.value = '';
      this.valueInvalidFeedback = null;
    },
  },
};
</script>
