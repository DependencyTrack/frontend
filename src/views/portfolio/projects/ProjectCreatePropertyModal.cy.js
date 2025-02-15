import { shouldShowModal } from '../../../../cypress/support/utils';

import ProjectCreatePropertyModal from './ProjectCreatePropertyModal.vue';

describe('ProjectCreatePropertyModal', () => {
  it('mounts successfully', () => {
    cy.mount(ProjectCreatePropertyModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('projectCreatePropertyModal');
  });
});
