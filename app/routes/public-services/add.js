import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { restartableTask, task } from 'ember-concurrency';

export default class PublicServicesAddRoute extends Route {
  @service store;
  @service formalInformalChoice;
  @service('concept') conceptService;

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    isNewConcept: {
      refreshModel: true,
    },
    isNotInstantiated: {
      refreshModel: true,
    },
    isYourEurope: {
      refreshModel: true,
    },
    page: {
      refreshModel: true,
    },
    sort: {
      refreshModel: true,
    },
    doelgroepenIds: {
      refreshModel: true,
    },
  };

  async model(params) {
    return {
      loadConceptualPublicServices:
        this.loadConceptualPublicServicesTask.perform(params),
      loadedConceptualPublicServices:
        this.loadConceptualPublicServicesTask.lastSuccessful?.value,
      formalInformalChoice: await this.formalInformalChoice.getChoice(),
      loadDoelgroepenOptions: await this.loadDoelgroepenConcepts.perform(),
    };
  }

  @restartableTask
  *loadConceptualPublicServicesTask({
    search,
    page,
    sort,
    isNewConcept,
    isNotInstantiated,
    isYourEurope,
    doelgroepenIds,
  }) {
    return yield this.conceptService.loadAllConcepts({
      search,
      page,
      sort,
      isNewConcept,
      isNotInstantiated,
      isYourEurope,
      doelgroepenIds,
    });
  }

  @task
  *loadDoelgroepenConcepts() {
    return yield this.store.query('concept', {
      'filter[concept-schemes][:uri:]':
        'https://productencatalogus.data.vlaanderen.be/id/conceptscheme/Doelgroep',
      sort: 'label',
    });
  }
}
