import BValidatedInputGroupFormInput from './BValidatedInputGroupFormInput.vue';

describe('BValidatedInputGroupFormInput', () => {
  it('mounts successfully', () => {
    const mockCommon = {
      toBoolean: cy.stub().callsFake((value) => {
        if (!value) return false;
        if (typeof value === 'boolean') return value;
        return ['true', 'yes', '1'].includes(value.toLowerCase().trim());
      }),
    };

    cy.mount(BValidatedInputGroupFormInput, {
      propsData: {
        id: 'test-validated-input',
        label: 'Test Validated Input',
        rules: 'required',
      },
    });

    cy.get('#test-validated-input').should('be.visible');
  });
});
