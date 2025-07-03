import BInputGroupFormSelect from './BInputGroupFormSelect.vue';

describe('BInputGroupFormSelect', () => {
  it('mounts successfully', () => {
    const mockCommon = {
      toBoolean: cy.stub().callsFake((value) => {
        if (!value) return false;
        if (typeof value === 'boolean') return value;
        return ['true', 'yes', '1'].includes(value.toLowerCase().trim());
      }),
    };

    cy.mount(BInputGroupFormSelect, {
      propsData: {
        id: 'test-select',
        label: 'Test Select',
        options: [
          { value: null, text: 'Please select an option' },
          { value: 'option1', text: 'Option 1' },
          { value: 'option2', text: 'Option 2' },
        ],
      },
    });

    cy.get('#test-select').should('be.visible');
  });
});
