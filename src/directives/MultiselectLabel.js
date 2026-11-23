/*
 * Multiselect Label Vue Directive
 *
 * vue-multiselect 3 gives its search input an aria-label, which overrides
 * the <label> that points at the input. Removing it lets the label name the input again.
 */
export default {
  mounted(el) {
    el.querySelector('.multiselect__input')?.removeAttribute('aria-label');
  },
};
