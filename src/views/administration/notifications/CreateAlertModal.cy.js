import {
  genAxiosResponse,
  shouldShowModal,
} from '../../../../cypress/support/utils';

import CreateAlertModal from './CreateAlertModal.vue';

describe('CreateAlertModal', () => {
  it('mounts successfully', () => {
    cy.mount(CreateAlertModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/notification/publisher': [],
          }),
        },
      },
    });

    shouldShowModal('createAlertModal');
  });
});
