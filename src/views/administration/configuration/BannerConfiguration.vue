<template>
  <div>
    <b-card no-body :header="header">
      <b-card-group>
        <b-card-body>
          <p>{{ $t('admin.banner_explanation') }}</p>
          <b-form-group
            label="Banner"
            label-size="lg"
            label-class="font-weight-bold pt-0 mb-2"
          >
            <div>
              <c-switch
                id="activateBanner"
                color="primary"
                v-model="activateBanner"
                label
                v-bind="labelIcon"
              />{{ $t('admin.banner_activate') }}
            </div>
            <div>
              <c-switch
                id="makeBannerDismissable"
                color="primary"
                v-model="makeBannerDismissable"
                label
                v-bind="labelIcon"
                :title="$t('admin.banner_dismissable_help')"
              />{{ $t('admin.banner_dismissable') }}
            </div>
            <label for="message">{{ $t('admin.banner_message') }}:</label>
            <textarea
              id="message"
              class="form-control"
              v-model="message"
              :disabled="customMode"
            />
            <label class="mt-3">{{ $t('admin.banner_color_scheme') }}:</label>
            <div
              class="swatches square large"
              role="radiogroup"
              aria-label="Choose color scheme"
            >
              <input
                v-for="(scheme, key) in colorSchemes"
                :key="key"
                type="radio"
                name="color-scheme"
                v-model="selectedColorScheme"
                :value="key"
                class="swatch-radio"
                :aria-label="scheme.name"
                :title="scheme.name"
                :style="{ backgroundColor: scheme.backgroundColor }"
                :disabled="customMode"
              />
            </div>
            <label class="mt-3">{{ $t('admin.banner_custom_mode') }}:</label>
            <div>
              <c-switch
                id="customMode"
                color="primary"
                v-model="customMode"
                label
                v-bind="labelIcon"
              />{{ $t('admin.banner_enable_custom') }}
            </div>
            <div v-if="customMode" class="mt-2">
              <label for="HTMLConfig"
                >{{ $t('admin.banner_html_text') }}:</label
              >
              <code-mirror-editor
                id="HTMLConfig"
                v-model="HTMLConfig"
                :language="htmlLanguage"
                :line-wrapping="false"
              />
              <small class="form-text text-muted">
                {{ $t('admin.banner_explanation_html_text') }}
              </small>
            </div>
          </b-form-group>
        </b-card-body>
      </b-card-group>
      <b-card-footer>
        <b-button
          :disabled="
            activateBanner &&
            (customMode ? !HTMLConfig.trim() : !message.trim())
          "
          variant="outline-primary"
          class="px-4"
          @click="saveChanges"
        >
          {{ $t('message.update') }}
        </b-button>
      </b-card-footer>
    </b-card>
  </div>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import { html } from '@codemirror/lang-html';
import CodeMirrorEditor from '@/views/components/CodeMirrorEditor.vue';
import configPropertyMixin from '../mixins/configPropertyMixin';
import { BANNER_SCHEMES } from '@/shared/bannerSchemes';
import {
  buildExampleBannerTemplate,
  getBannerConfigUrl,
  parseBannerConfigFromProperty,
  serializeBannerConfig,
} from '@/shared/bannerConfig';
import EventBus from '@/shared/eventbus';

export default {
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  components: {
    cSwitch,
    CodeMirrorEditor,
  },
  data() {
    return {
      activateBanner: false,
      makeBannerDismissable: false,
      message: '',
      selectedColorScheme: 'red',
      colorSchemes: BANNER_SCHEMES,
      customMode: false,
      HTMLConfig: '',
      htmlLanguage: html(),
    };
  },
  async created() {
    try {
      const response = await this.axios.get(getBannerConfigUrl(this.$api));
      this.applyBannerConfig(parseBannerConfigFromProperty(response) || {});
    } catch (error) {
      console.error('Error loading banner config:', error);
    }
  },
  watch: {
    customMode(val) {
      if (val) {
        this.message = '';
        this.HTMLConfig = buildExampleBannerTemplate();
      }
    },
  },
  methods: {
    applyBannerConfig(config) {
      this.activateBanner = !!config.activateBanner;
      this.makeBannerDismissable = !!config.makeBannerDismissable;
      this.message = config.message || '';
      this.selectedColorScheme = config.colorScheme || 'red';
      this.customMode = !!config.customMode;
      this.HTMLConfig = this.customMode ? config.html || '' : '';
    },
    async saveChanges() {
      const bannerConfig = this.customMode
        ? {
            activateBanner: this.activateBanner,
            makeBannerDismissable: this.makeBannerDismissable,
            customMode: true,
            html: this.HTMLConfig,
          }
        : {
            activateBanner: this.activateBanner,
            makeBannerDismissable: this.makeBannerDismissable,
            message: this.message,
            colorScheme: this.selectedColorScheme,
          };

      const success = await this.updateConfigProperties([
        {
          groupName: 'banner',
          propertyName: 'config',
          propertyValue: serializeBannerConfig(bannerConfig),
        },
      ]);
      if (success) {
        EventBus.$emit('banner-updated');
      }
    },
  },
};
</script>

<style scoped>
::v-deep .card-body {
  min-width: 0;
}

.swatches.square.large {
  display: flex;
  gap: 10px;
  padding: 8px 0;
}

.swatch-radio {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 50px;
  height: 50px;
  border: 3px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.swatch-radio:hover {
  transform: scale(1.1);
  border-color: #999;
}

.swatch-radio:checked {
  border-color: #321fdb;
  border-width: 4px;
  box-shadow: 0 0 0 2px rgba(50, 31, 219, 0.2);
}

.swatch-radio:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
}

.swatch-radio:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(50, 31, 219, 0.3);
}

.swatch-radio:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}
</style>
