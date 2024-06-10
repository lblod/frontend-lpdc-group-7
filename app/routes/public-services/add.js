import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

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
    page: {
      refreshModel: true,
    },
    sort: {
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
    };
  }

  @restartableTask
  *loadConceptualPublicServicesTask({
    search,
    page,
    sort,
    isNewConcept,
    isNotInstantiated,
  }) {
    return yield this.conceptService.loadAllConcepts({
      search,
      page,
      sort,
      isNewConcept,
      isNotInstantiated,
    });
  }
}
