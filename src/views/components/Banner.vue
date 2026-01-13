<template>
  <div>
    <header
      v-if="visible && !customMode"
      ref="banner"
      class="banner"
      :style="bannerStyles"
    >
      <span v-if="message">{{ message }}</span>
      <slot v-else>This is a Test Banner!</slot>
      <button
        v-if="dismissable"
        class="banner_close"
        type="button"
        :style="closeButtonStyles"
        @click="close"
      >
        <i class="fa fa-times"></i>
      </button>
    </header>

    <div
      v-else-if="visible && customMode"
      ref="banner"
      class="banner-custom"
      v-html="sanitizedHTML"
      @click="maybeClose"
    ></div>
  </div>
</template>

<script>
import { getBannerSchemes } from '@/shared/bannerColorSchemes';
import DOMPurify from 'dompurify';

export default {
  name: 'AppBanner',
  props: {
    dismissable: {
      type: Boolean,
      default: false,
    },
    sessionKey: {
      type: String,
      default: 'banner-dismissed',
    },
    message: {
      type: String,
      default: '',
    },
    colorScheme: {
      type: String,
      default: 'red',
      validator: (value) => {
        return ['red', 'orange', 'green', 'blue', 'lilac'].includes(value);
      },
    },
    customMode: { type: Boolean, default: false },
    html: { type: String, default: '' },
  },
  data() {
    return {
      visible: true,
    };
  },
  computed: {
    activeColorScheme() {
      return getBannerSchemes(this.colorScheme);
    },
    bannerStyles() {
      return {
        backgroundColor: this.activeColorScheme.backgroundColor,
        color: this.activeColorScheme.textColor,
        borderBottomColor: this.activeColorScheme.borderColor,
        fontSize: '18px',
        lineHeight: '1.4',
        paddingTop: '20px',
        paddingBottom: '20px',
        paddingLeft: '20px',
        paddingRight: this.dismissable ? '60px' : '20px',
      };
    },
    closeButtonStyles() {
      return {
        color: this.activeColorScheme.textColor,
      };
    },
    sanitizedHTML() {
      return DOMPurify.sanitize(this.html, {
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
  mounted() {
    const wasDismissed =
      this.dismissable && sessionStorage.getItem(this.sessionKey) === 'true';
    if (wasDismissed) this.visible = false;

    this.$nextTick(() => this.updateOffset());
    window.addEventListener('resize', this.updateOffset);
  },
  updated() {
    this.$nextTick(() => this.updateOffset());
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateOffset);
    this.clearOffset();
  },
  methods: {
    updateOffset() {
      if (!this.visible) {
        this.clearOffset();
        return;
      }
      const b = this.$refs.banner;
      if (b) {
        const height = b.offsetHeight || 0;
        document.documentElement.style.setProperty(
          '--banner-offset',
          `${height}px`,
        );
      }
    },
    clearOffset() {
      document.documentElement.style.removeProperty('--banner-offset');
    },
    close() {
      this.visible = false;
      if (this.dismissable) {
        sessionStorage.setItem(this.sessionKey, 'true');
      }
      this.clearOffset();
      this.$emit('dismiss');
    },
    maybeClose(e) {
      const selector = [
        '[data-banner-close]',
        '.banner-close',
        'button[aria-label="Close banner"]',
      ].join(', ');
      const el = e.target.closest(selector);
      if (el) {
        e.preventDefault();
        this.close();
      }
    },
  },
};
</script>

<style scoped>
.banner {
  text-align: center;
  font-weight: 500;
  border-bottom: 1px solid;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  width: 100%;
}
.banner_close {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.banner-custom {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  width: 100%;
}
</style>
