import { shouldShowModal } from '../../../../cypress/support/utils';

import ProjectDetailsModal from './ProjectDetailsModal.vue';

describe('ProjectDetailsModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['PORTFOLIO_MANAGEMENT']);

    cy.mount(ProjectDetailsModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      propsData: {
        project: {
          name: 'project',
        },
      },
    });

    shouldShowModal('projectDetailsModal');
  });
});
