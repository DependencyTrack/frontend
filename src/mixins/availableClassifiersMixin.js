export default {
  data() {
    return {
      availableClassifiers: [
        {
          value: 'NONE',
          text: this.$i18n.t('message.component_none_classifier'),
        },
        {
          value: 'APPLICATION',
          text: this.$i18n.t('message.component_application'),
        },
        {
          value: 'FRAMEWORK',
          text: this.$i18n.t('message.component_framework'),
        },
        { value: 'LIBRARY', text: this.$i18n.t('message.component_library') },
        {
          value: 'CONTAINER',
          text: this.$i18n.t('message.component_container'),
        },
        {
          value: 'OPERATING_SYSTEM',
          text: this.$i18n.t('message.component_operating_system'),
        },
        { value: 'DEVICE', text: this.$i18n.t('message.component_device') },
        { value: 'FIRMWARE', text: this.$i18n.t('message.component_firmware') },
        { value: 'FILE', text: this.$i18n.t('message.component_file') },
        { value: 'PLATFORM', text: this.$i18n.t('message.component_platform') },
        {
          value: 'DEVICE_DRIVER',
          text: this.$i18n.t('message.component_device_driver'),
        },
        {
          value: 'MACHINE_LEARNING_MODEL',
          text: this.$i18n.t('message.component_machine_learning_model'),
        },
        { value: 'DATA', text: this.$i18n.t('message.component_data') },
      ],
    };
  },
  computed: {
    sortAvailableClassifiers: function () {
      this.availableClassifiers.sort(function (a, b) {
        return a.value === 'NONE' ? -1 : a.text.localeCompare(b.text);
      });
      return this.availableClassifiers;
    },
  },
};
