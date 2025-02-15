<template>
  <b-card no-body :header="header">
    <b-card-body>
      <b-form-group>
        <b-validated-input-group-form-input
          id="base_url"
          :label="$t('admin.base_url')"
          input-group-size="mb-3"
          rules="required"
          type="url"
          v-model="baseUrl"
          tooltip="This URL is used to construct links back to Dependency-Track from external systems."
        />
        <c-switch
          id="isBadgesEnabled"
          color="primary"
          v-model="isBadgesEnabled"
          label
          v-bind="labelIcon"
        />{{ $t('admin.enable_svg_badge') }}
      </b-form-group>
      <b-form-group>
        <b-form-group
          :label="$t('admin.default_language')"
          label-size="lg"
          label-class="font-weight-bold pt-0 mb-2"
        >
          <p>{{ $t('admin.default_language_desc') }}</p>
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
      </b-form-group>
    </b-card-body>
    <b-card-footer>
      <b-button
        variant="outline-primary"
        class="px-4"
        @click="saveChanges"
        :disabled="this.isDefaultLanguageEnabled && this.defaultLanguage === ''"
        >{{ $t('message.update') }}</b-button
      >
    </b-card-footer>
  </b-card>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import BValidatedInputGroupFormInput from '@/forms/BValidatedInputGroupFormInput';
import common from '@/shared/common';
import configPropertyMixin from '@/views/administration/mixins/configPropertyMixin';
import {
  BButton,
  BCard,
  BCardBody,
  BCardFooter,
  BFormGroup,
  BFormSelect,
  BFormSelectOption,
  BInputGroup,
  BInputGroupPrepend,
} from 'bootstrap-vue';

export default {
  components: {
    cSwitch,
    BValidatedInputGroupFormInput,
    BCard,
    BCardBody,
    BFormGroup,
    BInputGroup,
    BInputGroupPrepend,
    BFormSelect,
    BFormSelectOption,
    BCardFooter,
    BButton,
  },
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  data() {
    return {
      baseUrl: '',
      isBadgesEnabled: false,
      isDefaultLanguageEnabled: false,
      defaultLanguage: 'en',
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
    };
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'general';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case 'base.url':
            this.baseUrl = item.propertyValue;
            break;
          case 'badge.enabled':
            this.isBadgesEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'default.locale':
            this.isDefaultLanguageEnabled = !!common.trimToNull(
              item.propertyValue,
            );
            this.defaultLanguage = this.isDefaultLanguageEnabled
              ? item.propertyValue
              : '';
            break;
        }
      }
    });
  },
  methods: {
    saveChanges: function () {
      this.updateConfigProperties([
        {
          groupName: 'general',
          propertyName: 'base.url',
          propertyValue: this.baseUrl,
        },
        {
          groupName: 'general',
          propertyName: 'badge.enabled',
          propertyValue: this.isBadgesEnabled,
        },
        {
          groupName: 'general',
          propertyName: 'default.locale',
          propertyValue: this.isDefaultLanguageEnabled
            ? this.defaultLanguage
            : null,
        },
      ]);
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
