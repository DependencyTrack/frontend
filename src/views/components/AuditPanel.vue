<template>
  <b-tabs v-model:index="auditDrawer.tabIndex" content-class="pt-3" no-fade>
    <b-tab :title="$t('message.analysis')">
      <slot />
      <hr />
      <audit-form
        v-if="canAnalyze"
        v-slot="{ form }"
        :loaded="loaded"
        :failed="failed"
        :submit="save"
        :states="states"
        :state-description="stateDescription"
        @state-change="
          (form, state) => $emit('state-change', form, state, loaded)
        "
      >
        <slot name="fields" :form="form" />
      </audit-form>
    </b-tab>
    <b-tab :title="$t('message.history')">
      <audit-history
        :comments="comments"
        :submit="canAnalyze && loaded ? addComment : null"
      />
    </b-tab>
  </b-tabs>
</template>

<script>
import common from '@/shared/common';
import AuditForm from '@/views/components/AuditForm.vue';
import AuditHistory from '@/views/components/AuditHistory.vue';

// fields maps each analysis field of the API to its value when unset; ids identify the analysis.
// noAnalysisStatus is the error status an API answers with before the first analysis exists.
export default {
  components: { AuditForm, AuditHistory },
  inject: ['auditDrawer'],
  props: {
    url: String,
    ids: Object,
    fields: Object,
    canAnalyze: Boolean,
    states: Array,
    stateDescription: String,
    noAnalysisStatus: Number,
  },
  emits: ['loaded', 'state-change'],
  data: () => ({ loaded: null, failed: false, comments: [] }),
  methods: {
    update(analysis) {
      this.loaded = Object.fromEntries(
        Object.entries(this.fields).map(([field, unset]) => [
          field,
          analysis[field] ?? unset,
        ]),
      );
      this.comments = analysis.analysisComments || [];
      this.$emit('loaded', analysis);
    },
    put(analysis, comment = null) {
      return this.axios.put(this.url, { ...this.ids, ...analysis, comment });
    },
    async save(form) {
      this.update((await this.put(form)).data);
      this.auditDrawer.notifySaved();
    },
    // A request without analysisState resets it to NOT_SET, so this resends the stored analysis.
    async addComment(comment) {
      const response = await this.put(this.loaded, comment);
      this.comments = response.data.analysisComments || [];
    },
  },
  beforeMount() {
    this.axios
      .get(common.setQueryParams(this.url, this.ids), {
        validateStatus: (status) =>
          status === 200 || status === this.noAnalysisStatus,
      })
      .then((response) =>
        this.update((response.status === 200 && response.data) || {}),
      )
      .catch(() => (this.failed = true));
  },
};
</script>
