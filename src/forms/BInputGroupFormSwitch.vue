<template>
  <div>
    <label class="d-block" v-if="showPlaceholderLabel">&nbsp;</label>
    <b-form-group
      :id="id"
      :label="currentLabel"
      :label-for="`${id}-input`"
      content-cols="auto"
    >
      <b-input-group :class="inputGroupSize">
        <c-switch
          :id="`${id}-input`"
          color="primary"
          v-model="innerValue"
          label
          v-bind="labelIcon"
          :readonly="readonly"
          :disabled="disabled"
          v-b-tooltip.hover
          :title="tooltip"
          v-on="inputListeners"
        />
      </b-input-group>
    </b-form-group>
  </div>
</template>

<script>
import common from '@/shared/common';
import { Switch as cSwitch } from '@coreui/vue';
import { BFormGroup, BInputGroup } from 'bootstrap-vue';

export default {
  components: {
    cSwitch,
    BFormGroup,
    BInputGroup,
  },
  props: {
    id: String,
    label: String, // fallback label if labelOn or labelOff not set
    labelOn: String, // if set will be used for "on" state
    labelOff: String, // if set will be used for "off" state
    value: Boolean,
    inputGroupSize: String,
    readonly: Boolean,
    disabled: Boolean,
    showPlaceholderLabel: Boolean, // can be used to show an empty label on top, useful to put on same row as other inputs
    tooltip: String,
  },
  data() {
    return {
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      currentLabel: (this.value ? this.labelOn : this.labelOff) || this.label,
    };
  },
  computed: {
    innerValue: {
      get: function () {
        return common.toBoolean(this.value);
      },
      set: function (newValue) {
        this.currentLabel =
          (newValue ? this.labelOn : this.labelOff) || this.label;
        return common.toBoolean(newValue);
      },
    },
    inputListeners: function () {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        change: function (event) {
          vm.$emit('input', event); // model doesn't update otherwise?
          vm.$emit('change', event);
        },
      });
    },
  },
  methods: {},
};
</script>
<style scoped>
.switch {
  margin-right: 0;
  margin-top: 0.25rem;
}

.form-group {
  flex-direction: row-reverse;
}

.form-group >>> label.col-form-label {
  padding-left: 0 !important;
}
</style>
