import Service from './Service.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('Service', () => {
  it('mounts successfully', () => {
    cy.setToken(['VIEW_PORTFOLIO']);

    cy.mount(Service, {
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/service/12345-67890-abcdef': {
              name: 'service name',
              group: 'service group',
              description: 'service description',
              version: '1.0.0',
              uuid: '12345-67890-abcdef',
              endpoints: [],
              data: [],
              externalReferences: [],
              project: {
                uuid: 'abcdef-67890-abcdef',
                name: 'project name',
              },
              provider: {
                name: 'provider name',
                urls: [],
                contacts: [],
              },
            },
          }),
        },
        $route: {
          params: {
            uuid: '12345-67890-abcdef',
          },
        },
      },
    });

    cy.get('div.animated.fadeIn').should('be.visible');
  });
});
