import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {dropTask} from 'ember-concurrency';
import {hasConcept, isConceptUpdated,} from 'frontend-lpdc/models/public-service';
import {inject as service} from '@ember/service';
import ENV from 'frontend-lpdc/config/environment';

export default class PublicServicesDetailsController extends Controller {
  @service store;
  @service('public-service') publicServiceService;

  @tracked shouldShowUnlinkWarning = false;
  get isConceptUpdatedStatus() {
    return isConceptUpdated(this.model.publicService.reviewStatus);
  }

  get canLinkConcept() {
    const { publicService } = this.model;

    return !hasConcept(publicService) && !publicService.isSent;
  }

  get canUnlinkConcept() {
    const { publicService } = this.model;
    return (
      hasConcept(publicService) &&
      !publicService.isSent &&
      !this.shouldShowUnlinkWarning
    );
  }

  get shouldShowConversionAlertPublishedInstance() {
    const { publicService, formalInformalChoice } = this.model;
    return (
      publicService.needsConversionFromFormalToInformal &&
      publicService.isSent &&
      formalInformalChoice.chosenForm === 'informal'
    );
  }
  get shouldShowConversionAlertDraftInstance() {
    const { publicService, formalInformalChoice } = this.model;
    return (
      publicService.needsConversionFromFormalToInformal &&
      !publicService.isSent &&
      formalInformalChoice.chosenForm === 'informal'
    );
  }

  get ipdcInformalLink() {
    const id = this.model.publicService.id;
    return `${ENV.ipdcUrl}/nl/informeel/instantie/${id}`;
  }

  get publicServiceDutchLanguageVariant() {
    switch (this.model.publicService.dutchLanguageVariant) {
      case 'nl-be-x-informal':
        return 'je-versie';
      case 'nl-be-x-formal':
        return 'u-versie';
      default:
        return 'onbekend';
    }
  }

  get shouldDisplayVersion() {
    return this.model.formalInformalChoice?.chosenForm === 'informal';
  }

  get shouldShowContentGeneratedWarning() {
    return (
      this.isNewlyCreatedPublicService &&
      this.publicServiceHasConcept &&
      this.isConceptLanguageVersionGenerated
    );
  }

  get publicServiceHasConcept() {
    return !!this.model.publicService.concept.id;
  }

  get isConceptLanguageVersionGenerated() {
    return this.model.languageVersionOfConcept.includes('generated');
  }

  get isNewlyCreatedPublicService() {
    const dateCreated = this.model.publicService.dateCreated.toString();
    const dateModified = this.model.publicService.dateModified.toString();
    return dateCreated === dateModified;
  }

  get ipdcConceptCompareLink() {
    const productId = this.model.publicService.concept.get('productId');
    const languageVersion =
      this.model.publicService.dutchLanguageVariant.toLowerCase() ===
      'nl-be-x-informal'
        ? 'nl/informeel'
        : 'nl';

    const latestSnapshot = this.getUuidFromUri(
      this.model.publicService.concept.get('hasLatestFunctionalChange')
    );
    const publicServiceSnapshot = this.getUuidFromUri(
      this.model.publicService.versionedSource
    );
    return `${ENV.ipdcUrl}/${languageVersion}/concept/${productId}/revisie/vergelijk?revisie1=${publicServiceSnapshot}&revisie2=${latestSnapshot}`;
  }

  @action
  showUnlinkWarning() {
    this.shouldShowUnlinkWarning = true;
  }

  @action
  hideUnlinkWarning() {
    this.shouldShowUnlinkWarning = false;
  }

  @dropTask
  *markAsReviewed() {
    yield this.publicServiceService.confirmBijgewerktTotLatestFunctionalChange(
      this.model.publicService
    );
  }

  @dropTask()
  *unlinkConcept() {
    const { publicService } = this.model;
    yield this.publicServiceService.unlinkConcept(publicService);
    this.hideUnlinkWarning();
  }

  getUuidFromUri(uri) {
    const segmentedUri = uri.split('/');
    return segmentedUri[segmentedUri.length - 1];
  }
}
