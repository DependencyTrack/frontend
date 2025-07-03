import { shouldShowModal } from '../../../../cypress/support/utils';

import ServiceDetailsModal from './ServiceDetailsModal.vue';

describe('ServiceDetailsModal', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(ServiceDetailsModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      propsData: {
        service: {
          name: 'service name',
          group: 'service group',
          description: 'service description',
          version: '1.0.0',
          uuid: '12345-67890-abcdef',
          endpoints: [],
          data: [],
          externalReferences: [],
          provider: {
            name: 'provider name',
            urls: [],
            contacts: [],
          },
        },
      },
    });

    shouldShowModal('serviceDetailsModal');
  });
});
