<template>
  <b-input-group>
    <template #prepend>
      <b-input-group-text :title="$t('message.theme')">
        <span class="fa-solid fa-circle-half-stroke text-primary"></span>
      </b-input-group-text>
    </template>
    <b-form-select
      class="bg-widget"
      :aria-label="$t('message.theme')"
      :model-value="theme"
      :options="options"
      @update:model-value="onThemeSelected"
    />
  </b-input-group>
</template>

<script>
import { getTheme, setTheme } from '@/shared/theme';

export default {
  data() {
    return {
      theme: getTheme(),
    };
  },
  computed: {
    options() {
      return [
        { value: 'system', text: this.$t('message.theme_system') },
        { value: 'light', text: this.$t('message.theme_light') },
        { value: 'dark', text: this.$t('message.theme_dark') },
      ];
    },
  },
  methods: {
    onThemeSelected(value) {
      this.theme = value;
      setTheme(value);
    },
  },
};
</script>
