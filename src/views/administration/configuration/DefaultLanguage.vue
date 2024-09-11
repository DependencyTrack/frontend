<template>
  <b-card no-body :header="header">
    <b-card-group>
      <b-card-body>
        <p>{{ $t('admin.default_language_desc') }}</p>
        <b-form-group
          :label="$t('admin.default_language')"
          label-size="lg"
          label-class="font-weight-bold pt-0 mb-2"
        >
          <div id="customToolbar">
            <c-switch
              id="default-language-enabled"
              color="primary"
              v-model="isDefaultLanguageEnabled"
              label
              v-bind="labelIcon"
            />{{ $t('admin.default_language_enable') }}
          </div>
        </b-form-group>
        <b-input-group>
          <b-input-group-prepend :title="this.$t('message.language')" is-text>
            <span class="fa fa-language text-primary"></span>
          </b-input-group-prepend>
          <b-form-select
            class="bg-widget"
            v-model="defaultLanguage"
            :disabled="!isDefaultLanguageEnabled"
          >
            <b-form-select-option
              v-for="locale in $i18n.availableLocales"
              :key="`locale-${locale}`"
              :value="locale"
              :title="$t(`language.${locale}`)"
            >
              <span class="mr-2">{{ localeToFlag(locale) }}</span>
              {{ locale.toUpperCase() }}</b-form-select-option
            >
          </b-form-select>
        </b-input-group>
      </b-card-body>
    </b-card-group>
    <b-card-footer>
      <b-button
        :disabled="
          this.isDefaultLanguageEnabled && this.defaultLanguage === ' '
        "
        variant="outline-primary"
        class="px-4"
        @click="saveChanges"
      >
        {{ $t('message.update') }}
      </b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
import axios from 'axios';
import LocalePicker from '@/views/components/LocalePicker.vue';
import { Switch as cSwitch } from '@coreui/vue';
export default {
  props: {
    header: String,
  },
  components: {
    LocalePicker,
    cSwitch,
  },
  data() {
    return {
      isDefaultLanguageEnabled: false,
      defaultLanguage: 'en',
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
    };
  },
  created() {
    let url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/public/general/default.language`;
    axios.get(url).then((response) => {
      this.defaultLanguage = decodeURIComponent(response.data.propertyValue);
      this.isDefaultLanguageEnabled =
        decodeURIComponent(response.data.propertyValue) !== ' ';
    });
  },
  methods: {
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
    saveChanges() {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}`;
      axios
        .post(url, {
          groupName: 'general',
          propertyName: 'default.language',
          propertyValue: encodeURIComponent(
            this.isDefaultLanguageEnabled ? this.defaultLanguage : ' ',
          ),
        })
        .then((response) => {
          this.$toastr.s(this.$t('admin.configuration_saved'));
        })
        .catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
  },
};
</script>
