import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { serviceNeedsReview } from 'frontend-lpdc/models/public-service';

export default class PublicServicesIndexController extends Controller {
  @tracked search = '';
  @tracked sort = '-date-modified';
  @tracked page = 0;
  @tracked isReviewRequiredFilterEnabled = false;
  @tracked needsConversionFromFormalToInformalFilterEnabled = false;
  @tracked isYourEurope = false;
  @tracked producttypes = [];
  @tracked producttypesIds = [];
  @tracked doelgroepen = [];
  @tracked doelgroepenIds = [];
  @tracked themas = [];
  @tracked themaIds = [];
  serviceNeedsReview = serviceNeedsReview;

  get publicServices() {
    return this.getValueFromTask('loadPublicServices');
  }

  get producttypesOptions() {
    return this.getValueFromTask('loadProducttypesOptions');
  }

  get doelgroepenOptions() {
    return this.getValueFromTask('loadDoelgroepenOptions');
  }

  get themasOptions() {
    return this.getValueFromTask('loadThemasOptions');
  }

  get isChosenFormInformal() {
    return this.model.formalInformalChoice?.chosenForm === 'informal';
  }

  get showTableLoader() {
    return this.model.loadPublicServices.isRunning;
  }

  getValueFromTask(aTask) {
    if (this.model[aTask].isFinished) {
      return this.model[aTask].value;
    }

    return this.model[aTask] || [];
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

  @action
  handleYourEuropeFilterChange(value) {
    this.isYourEurope = value;
    this.resetPagination();
  }

  @action
  handleDoelgroepenFilterChange(values) {
    this.doelgroepen = sortByLabel(values);
    this.doelgroepenIds = this.doelgroepen.map((dg) => dg.id);
    this.resetPagination();
  }

  @action
  handleProducttypesFilterChange(values) {
    this.producttypes = sortByLabel(values);
    this.producttypesIds = this.producttypes.map((pt) => pt.id);
    this.resetPagination();
  }

  @action
  handleThemasFilterChange(values) {
    this.themas = sortByLabel(values);
    this.themaIds = this.themas.map((pt) => pt.id);
    this.resetPagination();
  }

  resetPagination() {
    this.page = 0;
  }
}

function sortByLabel(concepts = []) {
  return [...concepts].sort((a, b) => {
    return a.label.localeCompare(b.label);
  });
}
