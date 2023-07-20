import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import {restartableTask} from 'ember-concurrency';
import SelectUOrJeModal from "frontend-lpdc/components/select-u-or-je-modal";

export default class PublicServicesIndexRoute extends Route {
  @service store;
  @service currentSession;
  @service modals;

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

  beforeModel({}) {
    this.modals.open(SelectUOrJeModal, {
      submitHandler: (value) => console.log(`You chose ${value}`)
    });
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
    let query = {
      'filter[created-by][:uri:]': this.currentSession.group.uri,
      'page[number]': page,
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

    query['include'] = 'target-audiences,type,executing-authority-levels,status';

    return yield this.store.query('public-service', query);
  }
}
