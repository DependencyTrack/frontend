export default {
  methods: {
    auditRowAttributes(row) {
      const { title, subtitles } = this.auditTitle(row);
      return { tabindex: '0', 'aria-label': [title, ...subtitles].join(', ') };
    },
    openAudit(index) {
      this.$refs.auditDrawer.open(this.$refs.table.getData(), index);
    },
    onTableClick(event) {
      const tr = event.target.closest('tr[data-index]');
      if (
        tr &&
        !event.target.closest('a, button, input, label, select, textarea') &&
        !window.getSelection().toString()
      ) {
        this.openAudit(Number(tr.dataset.index));
      }
    },
    onTableKeydown(event) {
      if (
        event.target.matches('tr[data-index]') &&
        (event.key === 'Enter' || event.key === ' ')
      ) {
        event.preventDefault();
        this.openAudit(Number(event.target.dataset.index));
      }
    },
    auditRowElement(id) {
      return this.$el.querySelector(`tr[data-uniqueid="${CSS.escape(id)}"]`);
    },
    rememberAuditFocus() {
      this.focusedAuditRow = document.activeElement.dataset?.uniqueid;
    },
    // bootstrap-table rebuilds rows on every render, which drops aria-current and focus.
    markAuditRow(scroll = false) {
      this.$el
        .querySelectorAll('tr[aria-current]')
        .forEach((tr) => tr.removeAttribute('aria-current'));
      const row = this.$refs.auditDrawer.row;
      const tr = row && this.auditRowElement(row[this.options.uniqueId]);
      tr?.setAttribute('aria-current', 'true');
      if (scroll) {
        tr?.scrollIntoView({ block: 'nearest' });
      }
      if (this.focusedAuditRow && document.activeElement === document.body) {
        this.auditRowElement(this.focusedAuditRow)?.focus();
      }
      this.focusedAuditRow = null;
    },
    focusAuditRow(row) {
      this.markAuditRow();
      this.auditRowElement(row[this.options.uniqueId])?.focus();
    },
    onAuditSaved() {
      this.$refs.table.refresh({ silent: true });
    },
  },
};
