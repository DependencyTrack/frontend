import ChartEpssVsCvss from '@/views/dashboard/ChartEpssVsCvss.vue';

describe('ChartEpssVsCvss', () => {
  it('mounts successfully', () => {
    cy.mount(ChartEpssVsCvss, {
      propsData: {
        height: 300,
      },
    });
  });
});
