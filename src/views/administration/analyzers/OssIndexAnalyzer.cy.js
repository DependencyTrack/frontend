import OssIndexAnalyzer from './OssIndexAnalyzer.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('OssIndexAnalyzer', () => {
  it('mounts successfully', () => {
    cy.mount(OssIndexAnalyzer, {
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({ '/api/v1/configProperty/': [] }),
        },
      },
    });
  });
});
