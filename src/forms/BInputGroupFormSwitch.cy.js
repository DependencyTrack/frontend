import BInputGroupFormSwitch from './BInputGroupFormSwitch.vue';

describe('BInputGroupFormSwitch', () => {
  it('mounts successfully', () => {
    const mockCommon = {
      toBoolean: cy.stub().callsFake((value) => {
        if (!value) return false;
        if (typeof value === 'boolean') return value;
        return ['true', 'yes', '1'].includes(value.toLowerCase().trim());
      }),
    };

    cy.mount(BInputGroupFormSwitch, {
      propsData: {
        id: 'test-switch',
        label: 'Test Switch',
        value: false,
      },
    });

    cy.get('#test-switch').should('be.visible');
  });
});
