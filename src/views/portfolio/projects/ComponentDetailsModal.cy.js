import {
  genAxiosResponse,
  shouldShowModal,
} from '../../../../cypress/support/utils';

import ComponentDetailsModal from './ComponentDetailsModal.vue';

describe('ComponentDetailsModal', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(ComponentDetailsModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/license/concise': [],
          }),
        },
      },
      propsData: {
        component: {
          name: 'component',
          version: '1.0.0',
          supplier: {
            name: 'supplier',
          },
        },
      },
    });

    shouldShowModal('componentDetailsModal');
  });
});
