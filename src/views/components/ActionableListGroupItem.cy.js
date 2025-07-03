import ActionableListGroupItem from './ActionableListGroupItem.vue';

describe('ActionableListGroupItem', () => {
  it('mounts successfully', () => {
    cy.mount(ActionableListGroupItem, {
      propsData: {
        value: 'Test Item',
        tooltip: 'Test Tooltip',
      },
    });
  });
});
