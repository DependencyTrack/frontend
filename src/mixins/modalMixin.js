export default {
  props: {
    modelValue: Boolean,
  },
  emits: ['update:modelValue'],
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(visible) {
        this.$emit('update:modelValue', visible);
      },
    },
  },
};
