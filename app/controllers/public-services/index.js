import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { serviceNeedsReview } from 'frontend-lpdc/models/public-service';

export default class PublicServicesIndexController extends Controller {
  queryParams = [
    'search',
    'sort',
    'page',
    {
      isReviewRequiredFilterEnabled: 'review',
    },
  ];
  @tracked search = '';
  @tracked sort = '-date-modified';
  @tracked page = 0;
  @tracked isReviewRequiredFilterEnabled = false;
  @tracked needsConversionFromFormalToInformalFilterEnabled = false;
  serviceNeedsReview = serviceNeedsReview;

  get publicServices() {
    if (this.model.loadPublicServices.isFinished) {
      return this.model.loadPublicServices.value;
    }

    return this.model.loadedPublicServices || [];
  }

  get isChosenFormInformal() {
    return this.model.formalInformalChoice?.chosenForm === 'informal';
  }

  get isFiltering() {
    return Boolean(this.search);
  }

  get isLoading() {
    return this.model.loadPublicServices.isRunning;
  }

  get hasPreviousData() {
    return this.model.loadedPublicServices?.length > 0;
  }

  get showTableLoader() {
    // TODO: Add a different loading state when the table already contains data
    // At the moment the table is cleared and the loading animation is shown.
    // It would be better to keep showing the already loaded data with a spinner overlay.
    // return this.isLoading && !this.hasPreviousData;

    return this.isLoading;
  }

  get hasResults() {
    return this.publicServices?.length > 0;
  }

  get hasErrored() {
    return this.model.loadPublicServices.isError;
  }

  @restartableTask
  *searchTask(searchValue) {
    yield timeout(500);

    this.search = searchValue;
    this.resetPagination();
  }

  @action
  toggleReviewRequiredFilter() {
    this.isReviewRequiredFilterEnabled = !this.isReviewRequiredFilterEnabled;
    this.resetPagination();
  }

  @action
  toggleNeedsConversionFromFormalToInformalFilter() {
    this.needsConversionFromFormalToInformalFilterEnabled =
      !this.needsConversionFromFormalToInformalFilterEnabled;
    this.resetPagination();
  }

  resetPagination() {
    this.page = 0;
  }
}
