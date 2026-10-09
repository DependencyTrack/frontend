<template>
  <b-input-group>
    <b-input-group-prepend :title="this.$t('message.theme')" is-text>
      <span class="fa fa-adjust text-primary"></span>
    </b-input-group-prepend>
    <b-form-select
      class="bg-widget"
      v-model="selectedItem"
      :options="themeOptions"
      @change="onThemeSelected"
    />
  </b-input-group>
</template>

<script>
import { getTheme } from '@/shared/utils';

export default {
  data() {
    return {
      selectedItem: getTheme(),
    };
  },
  computed: {
    themeOptions() {
      return [
        { value: 'dark', text: this.$t('message.theme_dark') },
        { value: 'light', text: this.$t('message.theme_light') },
      ];
    },
  },
  methods: {
    onThemeSelected: function (value) {
      localStorage.setItem('Theme', value);
      // A loaded theme stylesheet cannot be unloaded.
      this.$router.go(0);
    },
  },
};
</script>
