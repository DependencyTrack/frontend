<template>
  <b-modal
    v-model="visible"
    no-stacking
    :title="$t('message.create_policy')"
    :ok-title="$t('message.create')"
    :cancel-title="$t('message.close')"
    :ok-disabled="submitting"
    :no-close-on-esc="submitting"
    :no-close-on-backdrop="submitting"
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
        :state="nameInvalidFeedback ? false : null"
      >
        <b-form-input
          id="name-input"
          v-model.trim="name"
          type="text"
          maxlength="255"
          autofocus
          aria-required="true"
          @update:model-value="nameInvalidFeedback = null"
        />
      </b-form-group>

      <b-form-group
        :label="$t('message.operator')"
        label-class="required"
        label-for="operator-input"
        :description="$t('message.operator_help')"
      >
        <b-form-select
          id="operator-input"
          v-model="operator"
          :options="operatorOptions"
          aria-required="true"
        />
      </b-form-group>

      <b-form-group
        :label="$t('message.violation_state')"
        label-class="required"
        label-for="violation-state-input"
        :description="$t('message.violation_state_help')"
      >
        <b-form-select
          id="violation-state-input"
          v-model="violationState"
          :options="violationStateOptions"
          aria-required="true"
        />
      </b-form-group>

      <button type="submit" style="display: none" />
    </b-form>
  </b-modal>
</template>

<script>
import permissionsMixin from '../../mixins/permissionsMixin';
import modalMixin from '@/mixins/modalMixin';

export default {
  name: 'createPolicyModal',
  mixins: [permissionsMixin, modalMixin],
  data() {
    return {
      name: '',
      nameInvalidFeedback: null,
      operator: 'ANY',
      violationState: 'INFO',
      submitting: false,
    };
  },
  computed: {
    operatorOptions() {
      return [
        { value: 'ANY', text: this.$t('operator.any') },
        { value: 'ALL', text: this.$t('operator.all') },
      ];
    },
    violationStateOptions() {
      return [
        { value: 'INFO', text: this.$t('violation.info') },
        { value: 'WARN', text: this.$t('violation.warn') },
        { value: 'FAIL', text: this.$t('violation.fail') },
      ];
    },
  },
  methods: {
    onOk(event) {
      event.preventDefault();
      this.onSubmit();
    },
    onSubmit() {
      if (this.submitting) return;
      this.resetValidationFeedback();

      if (!this.name || !this.name.trim()) {
        this.nameInvalidFeedback = this.$t('message.required_field');
        return;
      }

      this.submitting = true;
      this.axios
        .put(`${this.$api.BASE_URL}/${this.$api.URL_POLICY}`, {
          name: this.name,
          operator: this.operator,
          violationState: this.violationState,
        })
        .then(() => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('message.policy_created'));
          this.visible = false;
        })
        .finally(() => {
          this.submitting = false;
        });
    },
    resetValidationFeedback() {
      this.nameInvalidFeedback = null;
    },
    resetValues() {
      this.name = '';
      this.operator = 'ANY';
      this.violationState = 'INFO';
      this.submitting = false;
      this.resetValidationFeedback();
    },
  },
};
</script>
