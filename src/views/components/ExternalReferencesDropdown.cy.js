import ExternalReferencesDropdown from './ExternalReferencesDropdown.vue';

describe('ExternalReferencesDropdown', () => {
  it('mounts successfully', () => {
    const mockReferences = [
      { type: 'website', url: 'https://example.com' },
      { type: 'bom', url: 'https://example.org/bom' },
      { type: 'documentation', url: 'https://docs.example.com' },
    ];

    cy.mount(ExternalReferencesDropdown, {
      propsData: {
        externalReferences: mockReferences,
      },
    });
  });
});
