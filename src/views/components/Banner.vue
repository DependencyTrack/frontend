<template>
  <div>
    <header
      v-if="visible && !customMode"
      ref="banner"
      class="banner"
      :style="bannerStyles"
    >
      <span>{{ message }}</span>
      <button
        v-if="dismissable"
        class="banner-close"
        type="button"
        :style="closeButtonStyles"
        @click="close"
      >
        <i class="fa fa-times"></i>
      </button>
    </header>

    <div v-else-if="visible && customMode" ref="banner" class="banner-custom">
      <div ref="customContent" v-html="sanitizedHTML"></div>
      <button
        v-if="dismissable"
        class="banner-close"
        type="button"
        :style="customCloseButtonStyles"
        :aria-label="$t('admin.banner_dismiss')"
        @click="close"
      >
        <i class="fa fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import DOMPurify from 'dompurify';
import { BANNER_SCHEMES, getBannerSchemes } from '@/shared/bannerSchemes';
import { BANNER_DISMISSED_KEY } from '@/shared/bannerConfig';

export default {
  name: 'AppBanner',
  props: {
    dismissable: {
      type: Boolean,
      default: false,
    },
    sessionKey: {
      type: String,
      default: BANNER_DISMISSED_KEY,
    },
    message: {
      type: String,
      default: '',
    },
    colorScheme: {
      type: String,
      default: 'red',
      validator: (value) => {
        return Object.keys(BANNER_SCHEMES).includes(value);
      },
    },
    customMode: { type: Boolean, default: false },
    html: { type: String, default: '' },
  },
  data() {
    return {
      visible: true,
      customContentColor: null,
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
        fontSize: '1rem',
        lineHeight: '1.5',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        paddingLeft: '1rem',
        paddingRight: this.dismissable ? '2.5rem' : '1rem',
      };
    },
    closeButtonStyles() {
      return {
        color: this.activeColorScheme.textColor,
      };
    },
    customCloseButtonStyles() {
      return {
        color: this.customContentColor || '#000',
      };
    },
    sanitizedHTML() {
      return DOMPurify.sanitize(this.html);
    },
  },
  mounted() {
    const wasDismissed =
      this.dismissable && sessionStorage.getItem(this.sessionKey) === 'true';
    if (wasDismissed) this.visible = false;

    this.$nextTick(() => {
      this.updateOffset();
      this.updateCustomContentColor();
    });
    window.addEventListener('resize', this.updateOffset);
  },
  updated() {
    this.$nextTick(() => {
      this.updateOffset();
      this.updateCustomContentColor();
    });
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
    updateCustomContentColor() {
      if (!this.customMode) {
        return;
      }
      const content = this.$refs.customContent;
      if (!content) {
        return;
      }
      const target = content.querySelector('*') || content;
      const color = window.getComputedStyle(target).color;
      this.customContentColor = color || null;
    },
    close() {
      this.visible = false;
      if (this.dismissable) {
        sessionStorage.setItem(this.sessionKey, 'true');
      }
      this.clearOffset();
      this.$emit('dismiss');
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
.banner-close {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  font-size: 1.25rem;
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
