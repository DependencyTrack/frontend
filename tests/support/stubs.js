/**
 * Stands in for FilterPillDropdown, which owns the b-dropdown that every pill
 * drives through `this.$refs.pill`. The auto-generated stub carries no methods,
 * so `this.$refs.pill.hide()` would throw; this one keeps the ref contract.
 *
 * The value slot is rendered only while hasFilter is set, mirroring the v-else
 * branch in the real component. Pills read the applied filter unguarded in that
 * slot, so rendering it unconditionally would fail where production does not.
 *
 * Returns the component alongside the two mocks. Vue binds methods to the
 * instance, so the copies reachable through `$refs` are not the mocks
 * themselves and cannot be asserted on directly.
 */
export function createFilterPillDropdownStub() {
  const open = jest.fn();
  const hide = jest.fn();

  return {
    open,
    hide,
    stub: {
      name: 'FilterPillDropdown',
      props: ['fieldName', 'fieldLabel', 'icon', 'hasFilter'],
      methods: { open, hide },
      template:
        '<div class="filter-pill-dropdown-stub">' +
        '<span v-if="hasFilter" class="filter-pill-segment-value">' +
        '<slot name="value"></slot></span>' +
        '<slot></slot></div>',
    },
  };
}
