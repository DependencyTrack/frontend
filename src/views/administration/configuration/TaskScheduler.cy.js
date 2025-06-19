import TaskScheduler from './TaskScheduler.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('TaskScheduler', () => {
  it('mounts successfully', () => {
    cy.mount(TaskScheduler, {
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/configProperty/': [],
          }),
        },
      },
    });

    cy.get('div.card').should('be.visible');
  });
});
