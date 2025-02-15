import WidgetProjectsAtRisk from '@/views/dashboard/WidgetProjectsAtRisk.vue';

describe('WidgetProjectsAtRisk', () => {
  it('mounts successfully', () => {
    cy.mount(WidgetProjectsAtRisk, {
      propsData: {
        height: 70,
        width: 300,
      },
    });
  });
});
