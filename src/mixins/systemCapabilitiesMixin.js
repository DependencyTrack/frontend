import EventBus from '@/shared/eventbus';

export default {
  data() {
    return {
      systemCapabilities: undefined,
    };
  },
  created() {
    this.systemCapabilities = this.$systemCapabilities;
    this._onSystemCapabilitiesUpdated = (capabilities) => {
      this.systemCapabilities = capabilities;
    };
    EventBus.on('systemCapabilitiesUpdated', this._onSystemCapabilitiesUpdated);
  },
  beforeUnmount() {
    EventBus.off(
      'systemCapabilitiesUpdated',
      this._onSystemCapabilitiesUpdated,
    );
  },
};
