<template>
  <b-offcanvas
    :model-value="row !== undefined"
    class="audit-drawer"
    placement="end"
    width="520px"
    header-class="align-items-start"
    @hide="onHide"
    @hidden="onHidden"
  >
    <template #header="{ id, hide }">
      <h5 :id="`${id}-offcanvas-label`" class="offcanvas-title">
        <template v-if="heading"
          >{{ heading.title }}
          <span
            v-for="(subtitle, index) in heading.subtitles"
            :key="index"
            class="d-block mt-1 audit-meta"
            >{{ subtitle }}</span
          ></template
        >
      </h5>
      <div class="d-flex align-items-center gap-2 ms-auto ps-3 audit-meta">
        <span v-if="row" class="text-nowrap" aria-live="polite"
          >{{
            $t('message.position_of_total', {
              position: index + 1,
              total: rows.length,
            })
          }}
          <span class="visually-hidden">{{
            [heading.title, ...heading.subtitles].join(', ')
          }}</span></span
        >
        <!-- aria-disabled, not disabled: a disabled button would drop focus at the first or last row -->
        <b-button
          size="sm"
          variant="outline-secondary"
          :class="{ disabled: !canGo(-1) }"
          :aria-disabled="!canGo(-1)"
          :aria-label="$t('message.previous_row')"
          :title="$t('message.previous_row_shortcut')"
          aria-keyshortcuts="K"
          @click="go(-1)"
          ><i class="fa fa-fw fa-chevron-up" aria-hidden="true"
        /></b-button>
        <b-button
          size="sm"
          variant="outline-secondary"
          :class="{ disabled: !canGo(1) }"
          :aria-disabled="!canGo(1)"
          :aria-label="$t('message.next_row')"
          :title="$t('message.next_row_shortcut')"
          aria-keyshortcuts="J"
          @click="go(1)"
          ><i class="fa fa-fw fa-chevron-down" aria-hidden="true"
        /></b-button>
        <b-close-button
          class="ms-2"
          :aria-label="$t('message.close')"
          @click="hide('close')"
        />
      </div>
    </template>
    <slot v-if="shown" :row="shown" />
  </b-offcanvas>
</template>

<script>
export default {
  props: {
    title: Function,
  },
  emits: ['change', 'closed', 'saved'],
  provide() {
    return { auditDrawer: this };
  },
  data: () => ({
    rows: [],
    index: null,
    dirtyForms: new Set(),
    saving: false,
    tabIndex: 0,
    closedRow: null,
  }),
  computed: {
    row() {
      return this.index === null ? undefined : this.rows[this.index];
    },
    // Keeps the closed row's content until the pane has slid out.
    shown() {
      return this.row ?? this.closedRow;
    },
    heading() {
      return this.shown && this.title(this.shown);
    },
    dirty() {
      return this.dirtyForms.size > 0;
    },
  },
  mounted() {
    window.addEventListener('beforeunload', this.onBeforeUnload);
    document.addEventListener('keydown', this.onKeydown);
    // Project tabs stay mounted after a route change, so the pane has to close itself.
    this.removeRouterGuard = this.$router.beforeEach(
      (to, from) => to.path === from.path || !this.row || this.close(true),
    );
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.onBeforeUnload);
    document.removeEventListener('keydown', this.onKeydown);
    this.removeRouterGuard();
  },
  methods: {
    open(rows, index) {
      this.rows = rows;
      this.index = index;
      this.dirtyForms.clear();
      this.$emit('change', this.row);
    },
    canGo(delta) {
      const index = this.index + delta;
      return !this.saving && index >= 0 && index < this.rows.length;
    },
    go(delta) {
      if (this.canGo(delta) && this.canDiscard()) {
        this.open(this.rows, this.index + delta);
      }
    },
    // Only leaving the page may close the pane mid-save; the save still reaches the server.
    close(leaving = false) {
      if (!this.row || (this.saving && !leaving) || !this.canDiscard()) {
        return false;
      }
      this.closedRow = this.row;
      this.rows = [];
      this.index = null;
      this.dirtyForms.clear();
      return true;
    },
    setDirty(form, dirty) {
      if (dirty) {
        this.dirtyForms.add(form);
      } else {
        this.dirtyForms.delete(form);
      }
    },
    setSaving(saving) {
      this.saving = saving;
    },
    notifySaved() {
      this.$emit('saved');
    },
    canDiscard() {
      return (
        !this.dirty ||
        window.confirm(this.$t('message.discard_unsaved_changes'))
      );
    },
    // Changing rows or disabling a control drops focus.
    // A new tab panel needs a few frames before it can take it.
    reclaimFocus(el, attempts = 5) {
      if (!el?.isConnected || !document.activeElement.contains(el)) {
        return;
      }
      if (el.checkVisibility()) {
        el.focus();
      } else if (attempts > 0) {
        requestAnimationFrame(() => this.reclaimFocus(el, attempts - 1));
      }
    },
    onHidden() {
      if (!this.row) {
        this.$emit('closed', this.closedRow);
        this.closedRow = null;
      }
    },
    onHide(event) {
      if (this.row && !this.close()) {
        event.preventDefault();
      }
    },
    // J and K would type into text fields and jump to options in selects.
    onKeydown(event) {
      const delta = { j: 1, k: -1 }[event.key];
      if (
        delta &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.target.closest('.audit-drawer') &&
        !event.target.matches(
          'textarea, select, input:not([type=radio], [type=checkbox])',
        )
      ) {
        this.go(delta);
      }
    },
    onBeforeUnload(event) {
      if (this.dirty || this.saving) {
        event.preventDefault();
      }
    },
  },
};
</script>

<style>
.audit-drawer.offcanvas {
  --bs-offcanvas-bg: var(--dt-surface-raised);
  box-shadow: -0.25rem 0 1.25rem rgba(0, 0, 0, 0.22);
}
[data-bs-theme='dark'] .audit-drawer.offcanvas {
  box-shadow: -0.25rem 0 1.25rem rgba(0, 0, 0, 0.7);
}
.audit-table tbody tr[data-index] {
  cursor: pointer;
}
.audit-table tr[aria-current] {
  --bs-table-bg-state: var(--bs-table-active-bg);
}
.audit-drawer.offcanvas:focus,
.audit-drawer form[tabindex='-1']:focus {
  outline: none;
}
.audit-drawer .offcanvas-title {
  font-size: 1.25rem;
}
.audit-drawer .audit-meta {
  font-size: 0.875rem;
  font-weight: normal;
  color: var(--bs-secondary-color);
}
.audit-drawer .audit-details dt,
.audit-drawer .form-label {
  font-weight: 600;
  color: var(--bs-body-color);
}
.audit-drawer summary {
  color: var(--bs-link-color);
  cursor: pointer;
}
.audit-drawer .audit-facts .badge,
.audit-drawer .audit-facts .label {
  font-size: 0.75rem;
}
.audit-drawer .audit-details dd {
  margin-bottom: 0.75rem;
}
.audit-drawer .audit-details code {
  display: block;
  color: var(--bs-body-color);
  padding: 0.375rem 0.5rem;
  border-radius: var(--bs-border-radius);
  background: var(--bs-tertiary-bg);
  overflow-wrap: anywhere;
}
.audit-drawer .audit-ratings {
  display: grid;
  grid-template-columns: max-content max-content minmax(0, 1fr) max-content;
  gap: 0.25rem 0.75rem;
  align-items: center;
}
.audit-drawer .audit-ratings dd {
  margin: 0;
}
.audit-drawer .audit-ratings code {
  overflow: hidden;
  text-overflow: ellipsis;
}
.audit-drawer .audit-actions {
  position: sticky;
  bottom: calc(-1 * var(--bs-offcanvas-padding-y));
  margin: 0 calc(-1 * var(--bs-offcanvas-padding-x));
  padding: 0.75rem var(--bs-offcanvas-padding-x);
  background: var(--bs-offcanvas-bg);
  border-top: 1px solid var(--bs-border-color);
}
.audit-drawer .audit-facts {
  row-gap: 0.5rem;
}
.audit-drawer .audit-facts > * + * {
  margin-left: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1px solid var(--bs-border-color);
}
.audit-drawer .audit-text {
  white-space: pre-wrap;
}
.audit-drawer .audit-clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}
</style>
