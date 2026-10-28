<template>
  <div>
    <ol v-if="comments.length > 0" class="audit-history list-unstyled mb-0">
      <li v-for="(entry, index) in comments" :key="index">
        <div class="small text-muted">
          <span v-if="entry.commenter" class="fw-semibold text-body">{{
            entry.commenter
          }}</span>
          {{ formatTimestamp(entry.timestamp) }}
        </div>
        <div class="audit-history-comment">{{ entry.comment }}</div>
      </li>
    </ol>
    <p v-else class="text-muted">{{ $t('message.no_history') }}</p>
    <b-form
      v-if="submit"
      class="mt-3"
      @submit.prevent="add"
      @keydown.ctrl.enter.prevent="add"
      @keydown.meta.enter.prevent="add"
    >
      <b-form-group :label="$t('message.comment')" label-for="auditComment">
        <b-form-textarea
          id="auditComment"
          ref="comment"
          v-model.trim="comment"
          rows="3"
          :readonly="auditDrawer.saving"
        />
      </b-form-group>
      <div class="d-flex justify-content-end">
        <b-button
          type="submit"
          variant="primary"
          :disabled="!comment || auditDrawer.saving"
          >{{ $t('message.add_comment') }}</b-button
        >
      </div>
    </b-form>
  </div>
</template>

<script>
import common from '@/shared/common';

export default {
  inject: ['auditDrawer'],
  props: {
    comments: { type: Array, default: () => [] },
    submit: Function,
  },
  data: () => ({ comment: '' }),
  watch: {
    comment(comment) {
      this.auditDrawer.setDirty(this, !!comment);
    },
  },
  methods: {
    formatTimestamp(timestamp) {
      return common.formatTimestamp(timestamp, true);
    },
    async add() {
      if (!this.comment || this.auditDrawer.saving) {
        return;
      }
      // The comment is already on its way, so leaving mid-post must not ask about it.
      this.auditDrawer.setDirty(this, false);
      this.auditDrawer.setSaving(true);
      try {
        await this.submit(this.comment);
        this.comment = '';
        this.$toastr.s(this.$t('message.updated'));
      } catch {
        this.auditDrawer.setDirty(this, true);
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      } finally {
        this.auditDrawer.setSaving(false);
        this.$nextTick(() =>
          this.auditDrawer.reclaimFocus(this.$refs.comment?.$el),
        );
      }
    },
  },
};
</script>

<style scoped>
.audit-history li {
  position: relative;
  padding: 0 0 1rem 1.25rem;
  border-left: 1px solid var(--bs-border-color);
  margin-left: 0.3rem;
}
.audit-history li::before {
  content: '';
  position: absolute;
  left: -0.3rem;
  top: 0.3rem;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: var(--bs-secondary-color);
}
.audit-history-comment {
  white-space: pre-wrap;
  background: var(--bs-tertiary-bg);
  border-radius: var(--bs-border-radius);
  padding: 0.375rem 0.625rem;
  margin-top: 0.25rem;
}
</style>
