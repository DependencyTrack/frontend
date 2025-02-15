import TagList from './TagList.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('TagList', () => {
  it('mounts successfully', () => {
    cy.setToken(['VIEW_PORTFOLIO', 'TAG_MANAGEMENT']);

    cy.mount(TagList, {
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
          }),
        },
        $toastr: {
          s: cy.stub(),
          w: cy.stub(),
        },
      },
    });

    cy.get('.animated.fadeIn').should('exist');
  });
});
