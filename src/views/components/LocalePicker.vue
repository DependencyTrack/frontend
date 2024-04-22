<template>
  <b-input-group class="mr-3">
    <b-input-group-prepend :title="this.$t('message.language')" is-text>
      <span class="fa fa-language"> </span>
    </b-input-group-prepend>
    <b-form-select
      class="bg-widget"
      v-model="selectedItem"
      @change="onLocaleSelected"
    >
      <b-form-select-option
        v-for="locale in $i18n.availableLocales"
        :key="`locale-${locale}`"
        :value="locale"
        :title="$t(`language.${locale}`)"
      >
        {{ locale.toUpperCase() }}
      </b-form-select-option>
    </b-form-select>
  </b-input-group>
</template>

<script>
export default {
  data() {
    return {
      selectedItem: null,
    };
  },
  beforeMount() {
    this.selectedItem = this.$i18n.locale;
    console.log(this.selectedItem);
  },
  methods: {
    onLocaleSelected: function (value) {
      localStorage.setItem('Locale', value);
      this.$i18n.locale = value;
    },
  },
};
</script>
