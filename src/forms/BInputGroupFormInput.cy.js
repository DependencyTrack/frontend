import BInputGroupFormInput from './BInputGroupFormInput.vue';

describe('BInputGroupFormInput', () => {
  it('mounts successfully', () => {
    const mockCommon = {
      toBoolean: cy.stub().callsFake((value) => {
        if (!value) return false;
        if (typeof value === 'boolean') return value;
        return ['true', 'yes', '1'].includes(value.toLowerCase().trim());
      }),
    };

    cy.mount(BInputGroupFormInput, {
      propsData: {
        id: 'test-input',
        label: 'Test Input',
      },
    });

    cy.get('#test-input').should('be.visible');
  });
});
