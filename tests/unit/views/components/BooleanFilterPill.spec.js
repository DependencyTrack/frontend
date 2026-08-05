import BooleanFilterPill from '@/views/components/BooleanFilterPill.vue';
import { mountWithTranslations } from '../../../support/mount';

describe('BooleanFilterPill', () => {
  const createWrapper = (propsData = {}) =>
    mountWithTranslations(BooleanFilterPill, {
      propsData: {
        fieldName: 'onlyOutdated',
        fieldLabel: 'Only outdated',
        ...propsData,
      },
    });

  it('renders the field label', () => {
    expect(createWrapper().text()).toContain('Only outdated');
  });

  it('renders the icon when one is given', () => {
    const wrapper = createWrapper({ icon: 'fa-clock-o' });

    expect(wrapper.find('span.fa.fa-clock-o.mr-1').exists()).toBe(true);
  });

  it('renders no icon by default', () => {
    expect(createWrapper().find('span.fa.mr-1').exists()).toBe(false);
  });

  it('labels the clear control for assistive technology', () => {
    const clear = createWrapper().find('.filter-pill-segment-clear');

    expect(clear.attributes('title')).toBe('message.clear');
    expect(clear.attributes('aria-label')).toBe('message.clear Only outdated');
  });

  it.each([
    ['a click', 'click'],
    ['the enter key', 'keydown.enter'],
    ['the space key', 'keydown.space'],
  ])('clears the filter on %s', async (_label, event) => {
    const wrapper = createWrapper({ value: true });

    await wrapper.find('.filter-pill-segment-clear').trigger(event);

    expect(wrapper.emitted('input')).toEqual([[false]]);
  });

  describe('props', () => {
    // Asserted against the options object rather than by mounting with invalid
    // props, because tests/setup.js promotes Vue warnings to failures.
    it('requires the field name and label', () => {
      expect(BooleanFilterPill.props.fieldName.required).toBe(true);
      expect(BooleanFilterPill.props.fieldLabel.required).toBe(true);
    });

    it('defaults the icon to null and the value to false', () => {
      expect(BooleanFilterPill.props.icon.default).toBeNull();
      expect(BooleanFilterPill.props.value.default).toBe(false);
    });
  });
});
