import TextFilterPill from '@/views/components/TextFilterPill.vue';
import { mountWithBootstrapVue } from '../../../support/mount';
import { createFilterPillDropdownStub } from '../../../support/stubs';

describe('TextFilterPill', () => {
  let dropdown;

  const createWrapper = (propsData = {}) => {
    dropdown = createFilterPillDropdownStub();
    return mountWithBootstrapVue(TextFilterPill, {
      propsData: {
        fieldName: 'name',
        fieldLabel: 'Name',
        ...propsData,
      },
      stubs: { FilterPillDropdown: dropdown.stub },
    });
  };

  describe('the operators prop validator', () => {
    // Called directly rather than through mounting, so Vue's prop warning
    // machinery (which tests/setup.js turns into a failure) stays out of it.
    const { validator } = TextFilterPill.props.operators;

    it('accepts a supported operator', () => {
      expect(validator(['contains'])).toBe(true);
    });

    it('accepts an empty list', () => {
      expect(validator([])).toBe(true);
    });

    it('rejects and logs an unsupported operator', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      expect(validator(['nope'])).toBe(false);
      expect(consoleError).toHaveBeenCalledWith('Unknown operator nope');
    });

    it('rejects a missing list', () => {
      expect(validator(null)).toBe(false);
    });
  });

  describe('prop defaults', () => {
    it('offers every supported operator', () => {
      expect(TextFilterPill.props.operators.default()).toEqual([
        'equals',
        'contains',
        'starts_with',
      ]);
    });

    it('limits the value to 255 characters', () => {
      expect(TextFilterPill.props.maxLength.default).toBe(255);
    });
  });

  describe('syncing with the value prop', () => {
    it('adopts an incoming filter immediately', () => {
      const wrapper = createWrapper({
        value: { operator: 'contains', value: 'foo' },
      });

      expect(wrapper.vm.tmpOperator).toBe('contains');
      expect(wrapper.vm.tmpValue).toBe('foo');
    });

    it('resets to the first operator when there is no filter', () => {
      const wrapper = createWrapper({ value: null });

      expect(wrapper.vm.tmpOperator).toBe('equals');
      expect(wrapper.vm.tmpValue).toBe('');
    });

    it('resets when the incoming filter has no value', () => {
      const wrapper = createWrapper({ value: { operator: 'contains' } });

      expect(wrapper.vm.tmpOperator).toBe('equals');
      expect(wrapper.vm.tmpValue).toBe('');
    });
  });

  describe('hasFilter', () => {
    it.each([
      ['no value', null],
      ['a value without text', { operator: 'equals' }],
    ])('is falsy for %s', (_label, value) => {
      expect(createWrapper({ value }).vm.hasFilter).toBeFalsy();
    });

    it('is truthy for a complete filter', () => {
      expect(
        createWrapper({ value: { operator: 'equals', value: 'x' } }).vm
          .hasFilter,
      ).toBeTruthy();
    });
  });

  describe('operatorAbbrev', () => {
    it.each([
      ['equals', '='],
      ['contains', '~'],
      ['starts_with', '^'],
    ])('abbreviates %s as %s', (operator, symbol) => {
      const wrapper = createWrapper({ value: { operator, value: 'x' } });

      expect(wrapper.vm.operatorAbbrev).toBe(symbol);
    });
  });

  it('renders the abbreviated filter in the value slot', () => {
    const wrapper = createWrapper({
      value: { operator: 'contains', value: 'foo' },
    });

    expect(wrapper.text()).toContain('~ "foo"');
  });

  describe('applyFilter', () => {
    it('emits the trimmed value and closes the dropdown', async () => {
      const wrapper = createWrapper();
      await wrapper.setData({ tmpOperator: 'contains', tmpValue: '  foo  ' });

      wrapper.vm.applyFilter();

      expect(wrapper.emitted('input')).toEqual([
        [{ operator: 'contains', value: 'foo' }],
      ]);
      expect(dropdown.hide).toHaveBeenCalled();
    });

    it.each([
      ['a whitespace-only value', '   '],
      ['an empty value', ''],
    ])('does nothing for %s', async (_label, tmpValue) => {
      const wrapper = createWrapper();
      await wrapper.setData({ tmpValue });

      wrapper.vm.applyFilter();

      expect(wrapper.emitted('input')).toBeUndefined();
      expect(dropdown.hide).not.toHaveBeenCalled();
    });

    it('is triggered by pressing enter in the value input', async () => {
      const wrapper = createWrapper();
      await wrapper.setData({ tmpValue: 'foo' });

      await wrapper.find('input').trigger('keyup.enter');

      expect(wrapper.emitted('input')).toEqual([
        [{ operator: 'equals', value: 'foo' }],
      ]);
    });
  });

  describe('clearFilter', () => {
    it('resets the draft, closes the dropdown and emits null', async () => {
      const wrapper = createWrapper({
        value: { operator: 'contains', value: 'foo' },
      });

      wrapper.vm.clearFilter();

      expect(wrapper.vm.tmpOperator).toBe('equals');
      expect(wrapper.vm.tmpValue).toBe('');
      expect(dropdown.hide).toHaveBeenCalled();
      expect(wrapper.emitted('input')).toEqual([[null]]);
    });
  });

  describe('onDropdownHide', () => {
    it('restores the draft from the applied filter', async () => {
      const wrapper = createWrapper({
        value: { operator: 'contains', value: 'foo' },
      });
      await wrapper.setData({ tmpOperator: 'equals', tmpValue: 'edited' });

      wrapper.vm.onDropdownHide();

      expect(wrapper.vm.tmpOperator).toBe('contains');
      expect(wrapper.vm.tmpValue).toBe('foo');
    });

    it('resets the draft when no filter is applied', async () => {
      const wrapper = createWrapper({ value: null });
      await wrapper.setData({ tmpOperator: 'contains', tmpValue: 'edited' });

      wrapper.vm.onDropdownHide();

      expect(wrapper.vm.tmpOperator).toBe('equals');
      expect(wrapper.vm.tmpValue).toBe('');
    });
  });

  it('delegates open() to the dropdown', () => {
    const wrapper = createWrapper();

    wrapper.vm.open();

    expect(dropdown.open).toHaveBeenCalled();
  });

  it('disables the apply button while the value is empty', async () => {
    const wrapper = createWrapper();

    expect(wrapper.find('button').attributes('disabled')).toBeDefined();

    await wrapper.setData({ tmpValue: 'foo' });

    expect(wrapper.find('button').attributes('disabled')).toBeUndefined();
  });
});
