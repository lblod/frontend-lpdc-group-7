import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import SelectUOrJeModalComponent from 'frontend-lpdc/components/select-u-or-je-modal';

export default class PublicServicesAddController extends Controller {
  @service router;
  @service modals;
  @service('public-service') publicServiceService;
  @service('concept') conceptService;
  @service('formal-informal-choice') formalInformalChoiceService;
  queryParams = [
    'search',
    'sort',
    'page',
    {
      isNewConcept: {
        type: 'boolean',
      },
      isNotInstantiated: {
        type: 'boolean',
      },
      isYourEurope: {
        type: 'boolean',
      },
    },
  ];
  @tracked search = '';
  @tracked sort = 'name';
  @tracked page = 0;
  @tracked isNewConcept = false;
  @tracked isNotInstantiated = false;
  @tracked isYourEurope = false;
  @tracked doelgroepen = [];
  @tracked doelgroepenIds = [];
  @tracked formalInformalChoice = this.model.formalInformalChoice;

  get publicServices() {
    if (this.model.loadConceptualPublicServices.isFinished) {
      return this.model.loadConceptualPublicServices.value;
    }

    return this.model.loadedConceptualPublicServices || [];
  }

  get doelgroepenOptions() {
    if (this.model.loadDoelgroepenOptions.isFinished) {
      return this.model.loadDoelgroepenOptions.value;
    }

    return this.model.loadDoelgroepenOptions || [];
  }

  get isLoading() {
    return this.model.loadConceptualPublicServices.isRunning;
  }

  get hasPreviousData() {
    return this.model.loadedConceptualPublicServices?.length > 0;
  }

  get showTableLoader() {
    // TODO: Add a different loading state when the table already contains data
    // At the moment the table is cleared and the loading animation is shown.
    // It would be better to keep showing the already loaded data with a spinner overlay.
    // return this.isLoading && !this.hasPreviousData;

    return this.isLoading;
  }

  get hasResults() {
    return this.publicServices.length > 0;
  }

  get hasErrored() {
    return this.model.loadConceptualPublicServices.isError;
  }

  get hasActiveFilters() {
    return (
      Boolean(this.search) ||
      this.isNewConcept === true ||
      this.isNotInstantiated === true ||
      this.isYourEurope === true ||
      this.doelgroepen.length > 0
    );
  }

  @action
  handleNewConceptFilterChange(value) {
    this.isNewConcept = value;
    this.page = 0;
  }

  @action
  handleNotInstantiatedConceptFilterChange(value) {
    this.isNotInstantiated = value;
    this.page = 0;
  }

  @action
  handleYourEuropeConceptFilterChange(value) {
    this.isYourEurope = value;
    this.page = 0;
  }

  @action
  handleDoelgroepenConceptFilterChange(values) {
    console.log(values);
    this.doelgroepen = values;
    this.doelgroepenIds = this.doelgroepen.map(dg => dg.id);
    this.page = 0;
  }

  @action
  resetFilters() {
    this.search = '';
    this.page = 0;
    this.isNewConcept = false;
    this.isNotInstantiated = false;
    this.isYourEurope = false;
    this.doelgroepen = [];
    this.doelgroepenIds = [];
  }

  @restartableTask
  *searchTask(searchValue) {
    yield timeout(500);

    this.search = searchValue;
    this.page = 0;
  }

  @action
  async openSelectUOrJeModal() {
    const hasPublicServices =
      await this.publicServiceService.bestuurseenheidHasPublicServices();
    this.modals.open(SelectUOrJeModalComponent, {
      newLpdcUser: !hasPublicServices,
      submitHandler: async (value) => {
        await this.formalInformalChoiceService.saveChoice(value);
        this.formalInformalChoice =
          await this.formalInformalChoiceService.getChoice();
      },
      makeChoiceLaterHandler: () => {
        this.formalInformalChoiceService.makeChoiceLater();
      },
    });
  }

  @dropTask
  *createPublicService(conceptUuid) {
    const conceptId = conceptUuid
      ? (yield this.conceptService.loadConceptDetails(conceptUuid)).uri
      : undefined;
    const publicServiceUuid =
      yield this.publicServiceService.createPublicService(conceptId);
    this.router.transitionTo('public-services.details', publicServiceUuid);
  }
}
