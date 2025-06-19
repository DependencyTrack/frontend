import BInputGroupFormDatepicker from './BInputGroupFormDatepicker.vue';

describe('BInputGroupFormDatepicker', () => {
  it('mounts successfully', () => {
    const mockCommon = {
      toBoolean: cy.stub().callsFake((value) => {
        if (!value) return false;
        if (typeof value === 'boolean') return value;
        return ['true', 'yes', '1'].includes(value.toLowerCase().trim());
      }),
    };

    cy.mount(BInputGroupFormDatepicker, {
      propsData: {
        id: 'test-datepicker',
        label: 'Test Datepicker',
      },
    });

    cy.get('#test-datepicker').should('be.visible');
  });
});
