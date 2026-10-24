<template>
  <b-card no-body :header="header">
    <b-card-body>
      <p>{{ $t('admin.bom_formats_desc') }}</p>
      <b-form-group
        :label="$t('admin.bom_formats')"
        label-size="lg"
        label-class="fw-bold pt-0 mb-2"
      >
        <b-form-checkbox v-model="isCycloneDXEnabled" switch>{{
          $t('admin.enable_bom_cyclonedx')
        }}</b-form-checkbox>
      </b-form-group>
      <b-form-group
        :label="$t('admin.bom_validation')"
        label-size="lg"
        label-class="fw-bold pt-0 mb-2"
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
              <tags-input
                id="bomValidationTagsInclusive"
                v-model="bomValidationTagsInclusive"
                :placeholder="$t('message.add_tag')"
                class="text-lowercase"
              />
            </b-input-group>
            <b-input-group class="mb-2">
              <b-input-group-text class="justify-content w-25">
                <b-form-radio value="DISABLED_FOR_TAGS">{{
                  $t('admin.disabled_for_tags')
                }}</b-form-radio>
              </b-input-group-text>
              <tags-input
                id="bomValidationTagsExclusive"
                v-model="bomValidationTagsExclusive"
                :placeholder="$t('message.add_tag')"
                class="text-lowercase"
              />
            </b-input-group>
          </b-form-radio-group>
        </b-form-group>
      </b-form-group>
    </b-card-body>
    <b-card-footer>
      <b-button variant="primary" class="px-4" @click="saveChanges">{{
        $t('message.update')
      }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
import common from '../../../shared/common';
import TagsInput from '../../../forms/TagsInput.vue';
import configPropertyMixin from '../mixins/configPropertyMixin';

export default {
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  components: {
    TagsInput,
  },
  data() {
    return {
      isCycloneDXEnabled: false,
      bomValidationMode: '',
      bomValidationTagsExclusive: [],
      bomValidationTagsInclusive: [],
    };
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
          propertyValue: JSON.stringify(this.bomValidationTagsExclusive),
        },
        {
          groupName: 'artifact',
          propertyName: 'bom.validation.tags.inclusive',
          propertyValue: JSON.stringify(this.bomValidationTagsInclusive),
        },
      ]);
    },
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
            this.bomValidationTagsExclusive = JSON.parse(item.propertyValue);
            break;
          case 'bom.validation.tags.inclusive':
            this.bomValidationTagsInclusive = JSON.parse(item.propertyValue);
            break;
        }
      }
    });
  },
};
</script>
