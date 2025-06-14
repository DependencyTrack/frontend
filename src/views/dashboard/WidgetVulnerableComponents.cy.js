import WidgetVulnerableComponents from '@/views/dashboard/WidgetVulnerableComponents.vue';

describe('WidgetVulnerableComponents', () => {
  it('mounts successfully', () => {
    cy.mount(WidgetVulnerableComponents, {
      propsData: {
        height: 70,
        width: 300,
      },
    });
  });
});
