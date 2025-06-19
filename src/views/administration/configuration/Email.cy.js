import Email from './Email.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('Email', () => {
  it('mounts successfully', () => {
    cy.mount(Email, {
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/configProperty/': [
              {
                groupName: 'artifact',
                propertyName: 'cyclonedx.enabled',
                propertyValue: 'false',
              },
              {
                groupName: 'artifact',
                propertyName: 'bom.validation.mode',
                propertyValue: 'ENABLED',
              },
              {
                groupName: 'artifact',
                propertyName: 'bom.validation.tags.inclusive',
                propertyValue: '[]',
              },
            ],
          }),
        },
      },
    });

    cy.get('div.card').should('be.visible');
  });
});
