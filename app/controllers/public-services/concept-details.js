import Controller from '@ember/controller';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';

const ARCHIVED_STATUS =
  'http://lblod.data.gift/concepts/3f2666df-1dae-4cc2-a8dc-e8213e713081';

export default class PublicServicesConceptDetailsController extends Controller {
  @service router;
  @service('public-service') publicServiceService;
  queryParams = [{ isPreview: 'preview', publicServiceId: 'id' }];
  isPreview = false;
  publicServiceId = '';

  get isLinkFlowPreview() {
    return Boolean(this.publicServiceId);
  }

  get isArchived() {
    return this.model.concept.status?.uri === ARCHIVED_STATUS;
  }

  get isConceptLanguageVersionGenerated() {
    return this.model.languageVersionOfConcept.includes('generated');
  }

  @action
  async hideNewConceptMessage() {
    const { displayConfiguration } = this.model.concept;
    displayConfiguration.isNewConcept = false;
    try {
      await displayConfiguration.save();
    } catch (error) {
      // TODO: Something went wrong while saving, but a fully fledged error state seems overkill. We should send a message to GlitchTip.
    }
  }

  @dropTask
  *createPublicService(conceptId) {
    const publicServiceId = yield this.publicServiceService.createPublicService(
      conceptId
    );
    this.router.transitionTo('public-services.details', publicServiceId);
  }
}
