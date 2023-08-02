import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

export default class PublicServicesAddRoute extends Route {
  @service store;

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
    return {
      loadConceptualPublicServices:
        this.loadConceptualPublicServicesTask.perform(params),
      loadedConceptualPublicServices:
        this.loadConceptualPublicServicesTask.lastSuccessful?.value,
    };
  }

  @restartableTask
  *loadConceptualPublicServicesTask({
    search,
    page,
    sort,
    isNewConcept,
    isInstantiated,
  }) {
    let query = {
      'filter[:has-no:status]': 'yes',
      'page[number]': page,
      'fields[conceptual-public-services]':
        'name,display-configuration,product-id,type,target-audiences,competent-authority-levels,concept-tags',
      include:
        'display-configuration,target-audiences,concept-tags,competent-authority-levels,type',
    };

    if (search) {
      query['filter'] = search.trim();
    }

    if (typeof isNewConcept === 'boolean') {
      query['filter[display-configuration][is-new-concept]'] = isNewConcept;
    }

    if (typeof isInstantiated === 'boolean') {
      query['filter[display-configuration][is-instantiated]'] = isInstantiated;
    }

    if (sort) {
      query.sort = sort;
    }

    return yield this.store.query('conceptual-public-service', query);
  }
}
