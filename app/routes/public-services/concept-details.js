import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { loadConceptLanguageVersion } from 'frontend-lpdc/utils/concept';

export default class PublicServicesConceptDetailsRoute extends Route {
  @service store;

  async model({ conceptId }) {
    let concept = await this.store.findRecord(
      'conceptual-public-service',
      conceptId,
      {
        include: 'type,status,display-configuration',
      }
    );

    const languageVersionOfConcept = await loadConceptLanguageVersion(
      conceptId
    );

    return {
      concept,
      languageVersionOfConcept,
    };
  }
}
