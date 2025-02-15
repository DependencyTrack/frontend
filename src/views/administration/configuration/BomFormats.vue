<template>
  <b-card no-body :header="header">
    <b-card-body>
      <p>{{ $t('admin.bom_formats_desc') }}</p>
      <b-form-group
        :label="$t('admin.bom_formats')"
        label-size="lg"
        label-class="font-weight-bold pt-0 mb-2"
      >
        <c-switch
          color="primary"
          v-model="isCycloneDXEnabled"
          label
          v-bind="labelIcon"
        />{{ $t('admin.enable_bom_cyclonedx') }}
      </b-form-group>
      <b-form-group
        :label="$t('admin.bom_validation')"
        label-size="lg"
        label-class="font-weight-bold pt-0 mb-2"
      >
        <b-form-group
          :label="$t('admin.bom_validation_mode')"
          label-for="bomValidationModeRadio"
        >
          <b-form-radio-group
            id="bomValidationModeRadio"
            v-model="bomValidationMode"
          >
            <b-input-group class="mb-2">
              <b-input-group-text class="justify-content w-25">
                <b-form-radio value="ENABLED">{{
                  $t('admin.enabled')
                }}</b-form-radio>
              </b-input-group-text>
            </b-input-group>
            <b-input-group class="mb-2">
              <b-input-group-text class="justify-content w-25">
                <b-form-radio value="DISABLED">{{
                  $t('admin.disabled')
                }}</b-form-radio>
              </b-input-group-text>
            </b-input-group>
            <b-input-group class="mb-2">
              <b-input-group-text class="justify-content w-25">
                <b-form-radio value="ENABLED_FOR_TAGS">{{
                  $t('admin.enabled_for_tags')
                }}</b-form-radio>
              </b-input-group-text>
              <vue-tags-input
                id="input-4"
                v-model="bomValidationTagInclusive"
                :tags="bomValidationTagsInclusive"
                :add-on-key="addOnKeys"
                :placeholder="$t('message.add_tag')"
                @tags-changed="
                  (newTags) => (this.bomValidationTagsInclusive = newTags)
                "
                class="w-100 bg-transparent text-lowercase"
              />
            </b-input-group>
            <b-input-group class="mb-2">
              <b-input-group-text class="justify-content w-25">
                <b-form-radio value="DISABLED_FOR_TAGS">{{
                  $t('admin.disabled_for_tags')
                }}</b-form-radio>
              </b-input-group-text>
              <vue-tags-input
                id="input-4"
                v-model="bomValidationTagExclusive"
                :tags="bomValidationTagsExclusive"
                :add-on-key="addOnKeys"
                :placeholder="$t('message.add_tag')"
                @tags-changed="
                  (newTags) => (this.bomValidationTagsExclusive = newTags)
                "
                class="w-100 bg-transparent text-lowercase"
              />
            </b-input-group>
          </b-form-radio-group>
        </b-form-group>
      </b-form-group>
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveChanges">{{
        $t('message.update')
      }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import common from '@/shared/common';
import VueTagsInput from '@johmun/vue-tags-input';
import configPropertyMixin from '@/views/administration/mixins/configPropertyMixin';
import {
  BButton,
  BCard,
  BCardBody,
  BCardFooter,
  BFormGroup,
  BFormRadio,
  BFormRadioGroup,
  BInputGroup,
  BInputGroupText,
} from 'bootstrap-vue';

export default {
  components: {
    cSwitch,
    VueTagsInput,
    BCard,
    BCardBody,
    BFormGroup,
    BFormRadioGroup,
    BInputGroup,
    BInputGroupText,
    BFormRadio,
    BCardFooter,
    BButton,
  },
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  data() {
    return {
      isCycloneDXEnabled: false,
      bomValidationMode: '',
      bomValidationTagExclusive: '',
      bomValidationTagsExclusive: [],
      bomValidationTagInclusive: '',
      bomValidationTagsInclusive: [],
      addOnKeys: [9, 13, 32, ':', ';', ','], // Separators used when typing tags into the vue-tag-input
    };
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'artifact';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case 'cyclonedx.enabled':
            this.isCycloneDXEnabled = common.toBoolean(item.propertyValue);
            break;
          case 'bom.validation.mode':
            this.bomValidationMode = item.propertyValue;
            break;
          case 'bom.validation.tags.exclusive':
            this.bomValidationTagsExclusive = JSON.parse(
              item.propertyValue,
            ).map((tagName) => {
              return { text: tagName };
            });
            break;
          case 'bom.validation.tags.inclusive':
            this.bomValidationTagsInclusive = JSON.parse(
              item.propertyValue,
            ).map((tagName) => {
              return { text: tagName };
            });
            break;
        }
      }
    });
  },
  methods: {
    saveChanges: function () {
      this.updateConfigProperties([
        {
          groupName: 'artifact',
          propertyName: 'cyclonedx.enabled',
          propertyValue: this.isCycloneDXEnabled,
        },
        {
          groupName: 'artifact',
          propertyName: 'bom.validation.mode',
          propertyValue: this.bomValidationMode,
        },
        {
          groupName: 'artifact',
          propertyName: 'bom.validation.tags.exclusive',
          propertyValue: JSON.stringify(
            this.bomValidationTagsExclusive.map((tag) => {
              return tag.text;
            }),
          ),
        },
        {
          groupName: 'artifact',
          propertyName: 'bom.validation.tags.inclusive',
          propertyValue: JSON.stringify(
            this.bomValidationTagsInclusive.map((tag) => {
              return tag.text;
            }),
          ),
        },
      ]);
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/vendors/vue-tags-input/vue-tags-input';
</style>
