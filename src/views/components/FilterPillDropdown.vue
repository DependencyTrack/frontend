<template>
  <div :class="['filter-pill-wrapper', { 'filter-pill-active': hasFilter }]">
    <b-dropdown
      :id="`filter-pill-${fieldName}`"
      class="filter-pill"
      ref="dropdown"
      size="sm"
      variant="outline-primary"
      no-caret
      boundary="viewport"
      @show="$emit('show', $event)"
      @shown="focusFirstControl"
      @hide="onDropdownHide"
    >
      <template #button-content>
        <div class="d-flex align-items-center" v-if="!hasFilter">
          <span
            v-if="icon"
            :class="['fa', icon, 'mr-1']"
            aria-hidden="true"
          ></span>
          {{ fieldLabel }}
        </div>
        <div class="filter-pill-segments" v-else>
          <span class="filter-pill-segment filter-pill-segment-field">
            <span
              v-if="icon"
              :class="['fa', icon, 'mr-1']"
              aria-hidden="true"
            ></span>
            {{ fieldLabel }}
          </span>
          <span class="filter-pill-segment filter-pill-segment-value">
            <slot name="value"></slot>
          </span>
        </div>
      </template>
      <b-dropdown-form class="filter-pill-form" @submit.stop.prevent>
        <div class="filter-pill-body" ref="body" @keyup.enter="onEnter">
          <slot></slot>
        </div>
        <div class="filter-pill-footer" v-if="!autoApply">
          <b-link class="filter-pill-footer-clear" @click="$emit('clear')">{{
            $t('message.clear')
          }}</b-link>
          <b-button
            variant="primary"
            size="sm"
            :disabled="applyDisabled"
            @click="$emit('apply')"
            >{{ $t('message.apply') }}
          </b-button>
        </div>
      </b-dropdown-form>
    </b-dropdown>
    <button
      v-if="hasFilter"
      class="filter-pill-clear"
      type="button"
      :title="$t('message.clear')"
      :aria-label="$t('message.clear') + ' ' + fieldLabel"
      @click="$emit('clear')"
    >
      <span class="fa fa-times-circle" aria-hidden="true"></span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'FilterPillDropdown',
  props: {
    fieldName: {
      type: String,
      required: true,
    },
    fieldLabel: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: null,
    },
    hasFilter: {
      type: Boolean,
      required: true,
    },
    // Disables the footer's apply button. Ignored when `autoApply` is set.
    applyDisabled: {
      type: Boolean,
      default: false,
    },
    // For pills whose control commits on change, such as a single-choice
    // list. Hides the footer, leaving the pill's own button to clear.
    autoApply: {
      type: Boolean,
      default: false,
    },
  },
  beforeDestroy() {
    this._destroying = true;
  },
  methods: {
    open() {
      this.$refs.dropdown.show();
    },
    hide() {
      this.$refs.dropdown.hide();
    },
    onDropdownHide() {
      if (!this.hasFilter && !this._destroying) {
        this.$emit('dismiss');
      }
      this.$emit('hide');
    },
    onEnter(event) {
      // Links and buttons handle Enter themselves. Applying as well would
      // close the dropdown immediately after they run.
      const tag = event.target && event.target.tagName;
      if (tag === 'A' || tag === 'BUTTON') {
        return;
      }
      if (this.autoApply || this.applyDisabled) {
        return;
      }
      this.$emit('apply');
    },
    // Runs on `shown`, not `show`. b-dropdown queues its own focusMenu() in a
    // $nextTick from `show`, and that runs after ours and takes the focus back.
    //
    // Never focus a radio or checkbox. Arrow keys move *and* commit a radio
    // selection, so an auto-apply pill would fire as soon as a keyboard user
    // browsed its options. Free text beats a select regardless of DOM order.
    focusFirstControl() {
      const body = this.$refs.body;
      if (!body) {
        return;
      }
      const control =
        body.querySelector(
          'input:not([type="radio"]):not([type="checkbox"]):not([disabled])',
        ) || body.querySelector('select:not([disabled])');
      if (control) {
        control.focus();
      }
    },
  },
};
</script>

<style scoped src="./filter-pill.css"></style>
