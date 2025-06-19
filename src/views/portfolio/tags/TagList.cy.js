import { genAxiosResponse } from '../../../../cypress/support/utils';
import TagList from './TagList.vue';

describe('TagList', () => {
  it('mounts successfully', () => {
    cy.setToken(['VIEW_PORTFOLIO', 'TAG_MANAGEMENT']);

    cy.intercept('/api/v1/tag', []);
    cy.mount(TagList, {
      stubs: {
        // TODO this component causes the test to hang after execution
        'portfolio-widget-row': true,
      },
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/metrics/portfolio/90/days': [
              {
                vulnerabilities: 0,
                vulnerableComponents: 0,
                inheritedRiskScore: 0,
                firstOccurrence: 0,
                vulnerableProjects: 0,
              },
            ],
            '/api/v1/tag?searchText=&pageSize=10&pageNumber=1': {
              status: 200,
              headers: { 'X-Total-Count': '0' },
              data: [],
            },
          }),
        },
        $toastr: {
          s: cy.stub(),
          w: cy.stub(),
        },
      },
    });

    cy.get('div.animated.fadeIn').should('be.visible');
  });
});
