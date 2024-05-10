<template>
  <b-input-group>
    <b-input-group-prepend :title="this.$t('message.language')" is-text>
      <span class="fa fa-language text-primary"></span>
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
        <span class="mr-2">{{ localeToFlag(locale) }}</span>
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

      // NB: As of DT v4.11, not all UI elements are updated automatically
      // when the locale is changed. We force a page reload to work around
      // this, but it really is a crutch that should be replaced with a proper
      // solution in the future.
      this.$router.go(0);
    },
    localeToFlag: function (locale) {
      // Largely taken from wojtekmaj/country-code-to-flag-emoji. Adopted to be able to deal with locale codes as inputs.
      // https://github.com/wojtekmaj/country-code-to-flag-emoji/blob/ff0d3d2dd9680b6f860d85fc9e713e93e396adb7/src/index.ts

      let countryCode = locale.split('-').pop().toUpperCase();
      if (countryCode === 'EN') {
        countryCode = 'US'; // Sorry Britain!
      } else if (countryCode === 'HI') {
        countryCode = 'IN';
      } else if (countryCode === 'JA') {
        countryCode = 'JP';
      } else if (countryCode === 'ZH') {
        countryCode = 'CN';
      }

      return Array.from(countryCode)
        .map((letter) => letter.toLowerCase().charCodeAt(0) + 127365)
        .map((charCode) => String.fromCodePoint(charCode))
        .join('');
    },
  },
};
</script>
