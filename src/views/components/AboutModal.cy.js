import AboutModal from './AboutModal.vue';

describe('AboutModal', () => {
  it('mounts successfully', () => {
    const mockDtrack = {
      application: 'Dependency-Track',
      version: '1.0.0',
      uuid: '12345-67890',
      timestamp: Date.now(),
      database: {
        productName: 'Test DB',
        productVersion: '1.0',
      },
    };

    const mockVersion = {
      version: '1.0.0',
      uuid: '12345-67890',
      timestamp: Date.now(),
    };

    const mockAxios = {
      get: cy.stub().resolves({ data: mockDtrack }),
    };

    cy.mount(AboutModal, {
      mockApi: true,
      mocks: {
        $version: mockVersion,
        dtrack: mockDtrack,
        $dtrack: mockDtrack,
        axios: mockAxios,
      },
    });
  });
});
