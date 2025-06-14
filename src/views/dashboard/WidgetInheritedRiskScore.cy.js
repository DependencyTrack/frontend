import WidgetInheritedRiskScore from '@/views/dashboard/WidgetInheritedRiskScore.vue';

describe('WidgetInheritedRiskScore', () => {
  it('mounts successfully', () => {
    cy.mount(WidgetInheritedRiskScore, {
      propsData: {
        height: 70,
        width: 300,
      },
    });
  });
});
