<template>
  <b-modal
    v-model="visible"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('admin.create_secret')"
    @ok="onOk"
    @show="resetValues"
    @hidden="resetValues"
  >
    <b-form ref="form" @submit.stop.prevent="onSubmit">
      <b-form-group
        :label="$t('message.name')"
        label-class="required"
        label-for="name-input"
        :invalid-feedback="nameInvalidFeedback"
        :state="!nameInvalidFeedback"
      >
        <b-form-input
          id="name-input"
          v-model="name"
          :placeholder="$t('admin.create_secret_name_placeholder')"
          min="1"
          max="255"
          type="text"
          autofocus
          required
        />
      </b-form-group>

      <b-form-group
        :label="$t('message.value')"
        label-class="required"
        label-for="value-input"
        :invalid-feedback="valueInvalidFeedback"
        :state="!valueInvalidFeedback"
      >
        <b-form-textarea
          id="value-input"
          v-model="value"
          :placeholder="$t('admin.create_secret_value_placeholder')"
          trim
          required
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
          :placeholder="$t('admin.create_secret_description_placeholder')"
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
  data() {
    return {
      name: '',
      nameInvalidFeedback: null,
      description: '',
      descriptionInvalidFeedback: null,
      value: '',
      valueInvalidFeedback: null,
    };
  },
  methods: {
    onOk: function (event) {
      event.preventDefault();
      this.onSubmit();
    },
    onSubmit: function () {
      this.resetValidationFeedback();

      this.axios
        .post(`${this.$api.BASE_URL}/api/v2/secrets`, {
          name: this.name,
          description: this.description,
          value: this.value,
        })
        .then(() => {
          this.$emit('refreshTable');
          this.$toastr.s(
            this.$t('message.record_created_message'),
            this.$t('message.record_created_title'),
          );
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
                case 'name':
                  this.nameInvalidFeedback = validationErr.message;
                  break;
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
      this.nameInvalidFeedback = null;
      this.descriptionInvalidFeedback = null;
      this.valueInvalidFeedback = null;
    },
    resetValues: function () {
      this.name = '';
      this.nameInvalidFeedback = null;
      this.description = '';
      this.descriptionInvalidFeedback = null;
      this.value = '';
      this.valueInvalidFeedback = null;
    },
  },
};
</script>
