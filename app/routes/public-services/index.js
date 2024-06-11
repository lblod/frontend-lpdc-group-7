import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { restartableTask, task } from 'ember-concurrency';
import SelectUOrJeModal from 'frontend-lpdc/components/select-u-or-je-modal';

export default class PublicServicesIndexRoute extends Route {
  @service store;
  @service currentSession;
  @service modals;
  @service formalInformalChoice;
  @service('public-service') publicServiceService;

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    page: {
      refreshModel: true,
    },
    sort: {
      refreshModel: true,
    },
    isReviewRequiredFilterEnabled: {
      refreshModel: true,
    },
    needsConversionFromFormalToInformalFilterEnabled: {
      refreshModel: true,
    },
    isYourEurope: {
      refreshModel: true,
    },
    statusIds: {
      refreshModel: true,
    },
    producttypesIds: {
      refreshModel: true,
    },
    doelgroepenIds: {
      refreshModel: true,
    },
    themaIds: {
      refreshModel: true,
    },
  };

  async beforeModel() {
    const hasPublicServices =
      await this.publicServiceService.bestuurseenheidHasPublicServices();
    if (!(await this.formalInformalChoice.isChoiceMade())) {
      this.modals.open(SelectUOrJeModal, {
        newLpdcUser: !hasPublicServices,
        submitHandler: async (value) => {
          await this.formalInformalChoice.saveChoice(value);
        },
        makeChoiceLaterHandler: () => {
          this.formalInformalChoice.makeChoiceLater();
        },
      });
    }
  }

  async model(params) {
    return {
      formalInformalChoice: await this.formalInformalChoice.getChoice(),
      loadPublicServices: this.loadPublicServicesTask.perform(params),
      loadStatusesOptions: await this.statutesConcepts.perform(),
      loadProducttypesOptions: await this.producttypesConcepts.perform(),
      loadDoelgroepenOptions: await this.loadDoelgroepenConcepts.perform(),
      loadThemasOptions: await this.themasConcepts.perform(),
    };
  }

  @restartableTask
  *loadPublicServicesTask({
    search,
    page,
    sort,
    isReviewRequiredFilterEnabled,
    needsConversionFromFormalToInformalFilterEnabled,
    isYourEurope,
    doelgroepenIds,
    producttypesIds,
    themaIds,
    statusIds,
  }) {
    const query = {
      'filter[created-by][:uri:]': this.currentSession.group.uri,
      'page[number]': page,
      'fields[public-services]':
        'name,product-id,type,target-audiences,thematic-areas,publication-media,date-created,date-modified,status,needs-conversion-from-formal-to-informal,review-status',
      include:
        'type,target-audiences,thematic-areas,publication-media,status,review-status',
    };

    if (search) {
      query['filter'] = search.trim();
    }

    if (sort) {
      query.sort = sort;
    }

    if (isReviewRequiredFilterEnabled) {
      query['filter[:has:review-status]'] = true;
    }

    if (needsConversionFromFormalToInformalFilterEnabled) {
      query['filter[needs-conversion-from-formal-to-informal]'] = true;
    }

    if (isYourEurope) {
      query['filter[publication-media][:uri:]'] =
        'https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/YourEurope';
    }

    if (statusIds?.length > 0) {
      query['filter[status][:id:]'] = statusIds.join(',');
    }

    if (producttypesIds?.length > 0) {
      query['filter[type][:id:]'] = producttypesIds.join(',');
    }

    if (doelgroepenIds?.length > 0) {
      query['filter[target-audiences][:id:]'] = doelgroepenIds.join(',');
    }

    if (themaIds?.length > 0) {
      query['filter[thematic-areas][:id:]'] = themaIds.join(',');
    }

    return yield this.store.query('public-service', query);
  }

  @task
  *statutesConcepts() {
    return yield this.store.query('concept', {
      'filter[concept-schemes][:uri:]':
        'http://lblod.data.gift/concept-schemes/9cf6fa63-1f49-4d53-af06-e1c235ece10b',
      sort: 'label',
    });
  }

  @task
  *producttypesConcepts() {
    return yield this.store.query('concept', {
      'filter[concept-schemes][:uri:]':
        'https://productencatalogus.data.vlaanderen.be/id/conceptscheme/Type',
      sort: 'label',
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

  @task
  *themasConcepts() {
    return yield this.store.query('concept', {
      'filter[concept-schemes][:uri:]':
        'https://productencatalogus.data.vlaanderen.be/id/conceptscheme/Thema',
      sort: 'label',
    });
  }
}
