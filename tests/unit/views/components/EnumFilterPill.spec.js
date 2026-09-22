import EnumFilterPill from '@/views/components/EnumFilterPill.vue';
import { mountWithBootstrapVue } from '../../../support/mount';
import { createFilterPillDropdownStub } from '../../../support/stubs';

describe('EnumFilterPill', () => {
  let dropdown;

  const createWrapper = (propsData = {}) => {
    dropdown = createFilterPillDropdownStub();
    return mountWithBootstrapVue(EnumFilterPill, {
      propsData: {
        fieldName: 'severity',
        fieldLabel: 'Severity',
        options: ['CRITICAL', 'HIGH'],
        ...propsData,
      },
      stubs: { FilterPillDropdown: dropdown.stub },
    });
  };

  describe('the options prop validator', () => {
    const { validator } = EnumFilterPill.props.options;

    it('accepts a non-empty list', () => {
      expect(validator(['CRITICAL'])).toBe(true);
    });

    it.each([
      ['an empty list', []],
      ['a missing list', null],
    ])('rejects %s', (_label, value) => {
      expect(validator(value)).toBe(false);
    });
  });

  describe('selectOptions', () => {
    it('prepends a disabled placeholder', () => {
      const [placeholder] = createWrapper().vm.selectOptions;

      expect(placeholder).toEqual({
        value: null,
        text: '-- message.select --',
        disabled: true,
      });
    });

    it('normalizes string options into value/text pairs', () => {
      const wrapper = createWrapper({ options: ['CRITICAL'] });

      expect(wrapper.vm.selectOptions[1]).toEqual({
        value: 'CRITICAL',
        text: 'CRITICAL',
      });
    });

    it('passes object options through untouched', () => {
      const option = { value: 'CRITICAL', text: 'Critical' };
      const wrapper = createWrapper({ options: [option] });

      expect(wrapper.vm.selectOptions[1]).toBe(option);
    });
  });

  describe('displayValue', () => {
    it('resolves the label of an object option', () => {
      const wrapper = createWrapper({
        options: [{ value: 'CRITICAL', text: 'Critical' }],
        value: 'CRITICAL',
      });

      expect(wrapper.vm.displayValue).toBe('Critical');
    });

    it('falls back to the raw value for string options', () => {
      expect(createWrapper({ value: 'CRITICAL' }).vm.displayValue).toBe(
        'CRITICAL',
      );
    });

    it('falls back to the raw value when the option is unknown', () => {
      expect(createWrapper({ value: 'LOW' }).vm.displayValue).toBe('LOW');
    });

    it('is empty when no value is selected', () => {
      expect(createWrapper({ value: null }).vm.displayValue).toBe('');
    });
  });

  describe('hasFilter', () => {
    it.each([
      ['no value', null],
      ['an empty value', ''],
    ])('is false for %s', (_label, value) => {
      expect(createWrapper({ value }).vm.hasFilter).toBe(false);
    });

    it('is true for a selected value', () => {
      expect(createWrapper({ value: 'CRITICAL' }).vm.hasFilter).toBe(true);
    });
  });

  describe('syncing with the value prop', () => {
    it('adopts an incoming value immediately', () => {
      expect(createWrapper({ value: 'CRITICAL' }).vm.tmpValue).toBe('CRITICAL');
    });

    it('normalizes an empty incoming value to null', () => {
      expect(createWrapper({ value: '' }).vm.tmpValue).toBeNull();
    });
  });

  describe('applyFilter', () => {
    it('emits the selected value and closes the dropdown', async () => {
      const wrapper = createWrapper();
      await wrapper.setData({ tmpValue: 'HIGH' });

      wrapper.vm.applyFilter();

      expect(wrapper.emitted('input')).toEqual([['HIGH']]);
      expect(dropdown.hide).toHaveBeenCalled();
    });

    it('does nothing when nothing is selected', async () => {
      const wrapper = createWrapper();
      await wrapper.setData({ tmpValue: null });

      wrapper.vm.applyFilter();

      expect(wrapper.emitted('input')).toBeUndefined();
      expect(dropdown.hide).not.toHaveBeenCalled();
    });
  });

  describe('clearFilter', () => {
    it('resets the draft, closes the dropdown and emits null', () => {
      const wrapper = createWrapper({ value: 'CRITICAL' });

      wrapper.vm.clearFilter();

      expect(wrapper.vm.tmpValue).toBeNull();
      expect(dropdown.hide).toHaveBeenCalled();
      expect(wrapper.emitted('input')).toEqual([[null]]);
    });
  });

  describe('onDropdownHide', () => {
    it('restores the draft from the applied value', async () => {
      const wrapper = createWrapper({ value: 'CRITICAL' });
      await wrapper.setData({ tmpValue: 'HIGH' });

      wrapper.vm.onDropdownHide();

      expect(wrapper.vm.tmpValue).toBe('CRITICAL');
    });

    it('resets the draft when no value is applied', async () => {
      const wrapper = createWrapper({ value: null });
      await wrapper.setData({ tmpValue: 'HIGH' });

      wrapper.vm.onDropdownHide();

      expect(wrapper.vm.tmpValue).toBeNull();
    });
  });

  it('delegates open() to the dropdown', () => {
    const wrapper = createWrapper();

    wrapper.vm.open();

    expect(dropdown.open).toHaveBeenCalled();
  });
});
