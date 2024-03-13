import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
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
      loadPublicServices: this.loadPublicServicesTask.perform(params),
      loadedPublicServices: this.loadPublicServicesTask.lastSuccessful?.value,
    };
  }

  @restartableTask
  *loadPublicServicesTask({
    search,
    page,
    sort,
    isReviewRequiredFilterEnabled,
  }) {
    const query = {
      'filter[created-by][:uri:]': this.currentSession.group.uri,
      'page[number]': page,
      'fields[public-services]':
        'name,product-id,review-status,type,target-audiences,executing-authority-levels,date-created,date-modified,status',
      include:
        'target-audiences,type,executing-authority-levels,status,review-status',
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

    return yield this.store.query('public-service', query);
  }
}
