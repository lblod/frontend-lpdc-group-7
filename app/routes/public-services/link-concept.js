import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hasConcept } from 'frontend-lpdc/models/public-service';
import { restartableTask } from 'ember-concurrency';

export default class PublicServicesLinkConceptRoute extends Route {
  @service store;
  @service router;
  @service('public-service') publicServiceService;
  @service('concept') conceptService;

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    isNewConcept: {
      refreshModel: true,
    },
    isInstantiated: {
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
    const publicService =
      await this.publicServiceService.loadPublicServiceDetails(
        params.serviceId
      );

    if (hasConcept(publicService)) {
      return this.router.replaceWith(
        'public-services.details',
        publicService.id
      );
    }

    return {
      publicService,
      loadConcepts: this.loadConcepts.perform(params),
      loadedConcepts: this.loadConcepts.lastSuccessful?.value,
    };
  }

  @restartableTask
  *loadConcepts({ search, page, sort, isNewConcept, isInstantiated }) {
    return yield this.conceptService.loadAllConcepts({
      search,
      page,
      sort,
      isNewConcept,
      isInstantiated,
    });
  }
}
