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
            <div id="activateBanner">
              <c-switch
                id="activateBanner"
                color="primary"
                v-model="activateBanner"
                label
                v-bind="labelIcon"
              />{{ $t('admin.banner_activate') }}
            </div>
            <div id="makeBannerDismissable">
              <c-switch
                id="makeBannerDismissable"
                color="primary"
                v-model="makeBannerDismissable"
                label
                v-bind="labelIcon"
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
            <div id="customMode">
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
              <textarea
                id="HTMLConfig"
                class="form-control font-monospace"
                v-model="HTMLConfig"
                rows="8"
                spellcheck="false"
              ></textarea>
              <small class="form-text text-muted">
                {{ $t('admin.banner_explanation_html_text') }}
              </small>
            </div>
          </b-form-group>
        </b-card-body>
      </b-card-group>
      <b-card-footer>
        <b-button
          :disabled="customMode ? !HTMLConfig : !message"
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
import configPropertyMixin from '../mixins/configPropertyMixin';
import { BANNER_SCHEMES } from '@/shared/bannerColorSchemes';
import DOMPurify from 'dompurify';
import EventBus from '@/shared/eventbus';

export default {
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  components: {
    cSwitch,
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
    };
  },
  async created() {
    try {
      const response = await this.axios.get(this.$api.URL_BANNER);
      const config = response.data || {};

      this.activateBanner = !!config.activateBanner;
      this.makeBannerDismissable = !!config.makeBannerDismissable;
      this.message = config.message || '';
      this.selectedColorScheme = config.colorScheme || 'red';

      const hasCustomMode =
        typeof config.customMode === 'boolean'
          ? config.customMode
          : !!config.html;

      this.customMode = hasCustomMode;
      this.HTMLConfig = config.html || '';
    } catch (error) {
      console.error('Error loading banner config:', error);
    }
  },
  computed: {
    sanitizedHTML() {
      return DOMPurify.sanitize(this.HTMLConfig, {
        USE_PROFILES: { html: true },
        ALLOW_DATA_ATTR: true,
        ADD_TAGS: ['button', 'img'],
        ADD_ATTR: [
          'data-banner-close',
          'aria-label',
          'class',
          'type',
          'src',
          'srcset',
          'alt',
          'title',
          'width',
          'height',
          'loading',
          'decoding',
          'sizes',
        ],
      });
    },
  },
  watch: {
    customMode(val) {
      if (val) {
        this.message = '';
        this.HTMLConfig = this.buildTemplate(this.makeBannerDismissable);
      }
    },
    makeBannerDismissable(val) {
      if (this.customMode) {
        this.HTMLConfig = this.buildTemplate(val);
      }
    },
  },
  methods: {
    buildTemplate(includeClose) {
      const close = includeClose
        ? `<button type="button" class="banner_close" aria-label="Close banner" style="position:absolute;right:20px;top:50%;transform:translateY(-50%);background:transparent;border:none;font-size:28px;cursor:pointer;padding:0;line-height:1;color:#fff"><i class="fa fa-times"></i></button>`
        : '';

      const padding = includeClose ? '20px 60px 20px 20px' : '20px 20px';
      return `<div style="position:relative;background:#321FDB;color:#fff;padding:${padding};border-bottom:1px solid rgba(0,0,0,.2);font-size:18px;line-height:1.4;text-align:center">
        ${close}
        <strong>Example:</strong> <span>Your HTML-Banner Text</span>
      </div>
    `;
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

      try {
        await this.axios.post(this.$api.URL_BANNER, bannerConfig);
        this.$toastr.s(this.$t('message.updated'));
        EventBus.$emit('banner-updated');
      } catch (error) {
        this.$toastr.e(this.$t('condition.unsuccessful_action'));
        console.error('Error saving banner config:', error);
      }
    },
  },
};
</script>

<style scoped>
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
