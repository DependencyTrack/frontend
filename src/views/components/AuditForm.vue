<template>
  <b-form
    tabindex="-1"
    :aria-label="$t('message.analysis')"
    @submit.prevent="save"
    @keydown.ctrl.enter.prevent="save"
    @keydown.meta.enter.prevent="save"
  >
    <p v-if="failed" class="text-danger" role="alert">
      {{ $t('condition.unsuccessful_action') }}
    </p>
    <fieldset :disabled="!ready || auditDrawer.saving">
      <b-form-group
        :label="$t('message.analysis_state')"
        :description="stateDescription"
      >
        <b-form-radio-group
          v-model="form.analysisState"
          name="analysisState"
          buttons
          size="sm"
          class="flex-wrap gap-1"
          @update:model-value="$emit('state-change', form, $event)"
        >
          <b-form-radio
            v-for="state in states"
            :key="state.value"
            :value="state.value"
            :button-variant="
              form.analysisState === state.value
                ? state.variant
                : 'outline-secondary'
            "
            >{{ state.text }}</b-form-radio
          >
        </b-form-radio-group>
      </b-form-group>
      <slot :form="form" />
      <b-form-checkbox v-model="form.isSuppressed" class="mb-3">{{
        $t('message.suppressed')
      }}</b-form-checkbox>
      <div
        class="audit-actions d-flex justify-content-end align-items-center gap-2"
      >
        <span v-if="dirty" class="audit-meta me-auto">{{
          $t('message.unsaved_changes_badge')
        }}</span>
        <b-button v-if="dirty" variant="outline-secondary" @click="reset">{{
          $t('message.discard')
        }}</b-button>
        <b-button
          type="submit"
          variant="primary"
          :disabled="!dirty"
          :title="$t('message.save_shortcut')"
          aria-keyshortcuts="Control+Enter Meta+Enter"
          >{{ $t('message.save') }}</b-button
        >
      </div>
    </fieldset>
  </b-form>
</template>

<script>
export default {
  inject: ['auditDrawer'],
  props: {
    loaded: Object,
    failed: Boolean,
    submit: Function,
    states: Array,
    stateDescription: String,
  },
  emits: ['state-change'],
  data: () => ({ form: {} }),
  computed: {
    ready() {
      return this.loaded !== null;
    },
    dirty() {
      return (
        this.ready &&
        Object.keys(this.loaded).some(
          (field) => this.form[field] !== this.loaded[field],
        )
      );
    },
  },
  watch: {
    loaded: {
      handler() {
        this.reset();
      },
      immediate: true,
    },
    dirty(dirty) {
      this.auditDrawer.setDirty(this, dirty);
    },
  },
  mounted() {
    this.auditDrawer.reclaimFocus(this.$el);
  },
  methods: {
    reset() {
      this.form = { ...this.loaded };
    },
    async save() {
      if (!this.dirty || this.auditDrawer.saving) {
        return;
      }
      // The changes are already on their way, so leaving mid-save must not ask about them.
      this.auditDrawer.setDirty(this, false);
      this.auditDrawer.setSaving(true);
      try {
        await this.submit(this.form);
        this.$toastr.s(this.$t('message.updated'));
      } catch {
        this.auditDrawer.setDirty(this, true);
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      } finally {
        this.auditDrawer.setSaving(false);
        this.$nextTick(() => this.auditDrawer.reclaimFocus(this.$el));
      }
    },
  },
};
</script>
