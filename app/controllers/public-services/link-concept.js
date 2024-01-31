import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class PublicServicesLinkConceptIndexController extends Controller {
  @service('public-service') publicServiceService;
  @service router;

  queryParams = [
    'search',
    'sort',
    'page',
    {
      isNewConcept: {
        type: 'boolean',
      },
      isInstantiated: {
        type: 'boolean',
      },
    },
  ];
  @tracked search = '';
  @tracked isNewConcept;
  @tracked isInstantiated;
  @tracked sort = 'name';
  @tracked page = 0;

  get concepts() {
    if (this.model.loadConcepts.isFinished) {
      return this.model.loadConcepts.value;
    }

    return this.model.loadedConcepts || [];
  }

  get isLoading() {
    return this.model.loadConcepts.isRunning;
  }

  get hasPreviousData() {
    return this.model.loadedConcepts?.length > 0;
  }

  get showTableLoader() {
    // TODO: Add a different loading state when the table already contains data
    // At the moment the table is cleared and the loading animation is shown.
    // It would be better to keep showing the already loaded data with a spinner overlay.
    // return this.isLoading && !this.hasPreviousData;

    return this.isLoading;
  }

  get hasResults() {
    return this.concepts.length > 0;
  }

  get hasErrored() {
    return this.model.loadConcepts.isError;
  }

  get hasActiveFilters() {
    return (
      Boolean(this.search) ||
      typeof this.isNewConcept === 'boolean' ||
      typeof this.isInstantiated === 'boolean'
    );
  }

  @action
  handleNewConceptFilterChange(value) {
    this.isNewConcept = value;
    this.page = 0;
  }

  @action
  handleInstantiatedConceptFilterChange(value) {
    this.isInstantiated = value;
    this.page = 0;
  }

  @action
  resetFilters() {
    this.search = '';
    this.page = 0;
    this.isNewConcept = undefined;
    this.isInstantiated = undefined;
  }

  @restartableTask
  *searchTask(searchValue) {
    yield timeout(500);

    this.search = searchValue;
    this.page = 0;
  }

  @dropTask
  *linkConcept(concept) {
    const { publicService } = this.model;
    yield this.publicServiceService.linkConcept(publicService, concept);
    this.router.replaceWith('public-services.details', publicService.id);
  }
}
