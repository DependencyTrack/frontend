export default {
  props: {
    modelValue: Boolean,
  },
  emits: ['update:modelValue'],
  data() {
    return {
      confirming: false,
    };
  },
  methods: {
    // Bind :no-stacking="!confirming", or opening the confirmation hides this modal.
    async confirmDeleteOverModal(options) {
      this.confirming = true;
      try {
        return await this.$confirmDelete(options);
      } finally {
        this.confirming = false;
      }
    },
  },
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
