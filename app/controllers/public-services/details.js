import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import {
  hasConcept,
  isConceptUpdated,
} from 'frontend-lpdc/models/public-service';
import { inject as service } from '@ember/service';
import ENV from 'frontend-lpdc/config/environment';
import ConfirmConvertToInformalModalComponent from 'frontend-lpdc/components/confirm-convert-to-informal-modal';
import FullyTakeConceptSnapshotOverModalComponent from 'frontend-lpdc/components/fully-take-concept-snapshot-over';
import getUUIDFromUri from 'frontend-lpdc/helpers/get-uuid-from-uri';

export default class PublicServicesDetailsController extends Controller {
  @service store;
  @service modals;
  @service('public-service') publicServiceService;
  @service router;
  @service contextService;

  @tracked shouldShowUnlinkWarning = false;
  @tracked formHasUnsavedChanges = false;

  constructor() {
    super(...arguments);
    this.contextService.addParentContext(this);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.contextService.removeParentContext(this);
  }

  get isConceptUpdatedStatus() {
    return isConceptUpdated(this.model.publicService.reviewStatus);
  }

  get functionallyChangedFields() {
    return this.model.functionallyChangedFields.join(', ');
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
      publicService.isPublished &&
      formalInformalChoice.chosenForm === 'informal'
    );
  }

  get shouldShowConversionAlertDraftInstance() {
    const { publicService, formalInformalChoice } = this.model;
    return (
      publicService.needsConversionFromFormalToInformal &&
      !publicService.isPublished &&
      formalInformalChoice.chosenForm === 'informal'
    );
  }

  get ipdcInformalLink() {
    const instanceId = getUUIDFromUri(this.model.publicService.uri);
    return `${ENV.ipdcUrl}/nl/informeel/instantie/${instanceId}`;
  }

  get publicServiceDutchLanguageVariant() {
    switch (this.model.publicService.dutchLanguageVariant) {
      case 'nl-be-x-informal':
        return 'je-versie';
      case 'nl-be-x-formal':
        return 'u-versie';
      default:
        return 'u/je onbepaald';
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

    const latestSnapshot = getUUIDFromUri(
      this.model.publicService.concept.get('hasLatestFunctionalChange')
    );
    const publicServiceSnapshot = getUUIDFromUri(
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
    yield this.publicServiceService.confirmUpToDateTillLatestFunctionalChange(
      this.model.publicService
    );
  }

  @dropTask()
  *unlinkConcept() {
    const { publicService } = this.model;
    yield this.publicServiceService.unlinkConcept(publicService);
    this.hideUnlinkWarning();
  }

  @dropTask()
  *confirmInstanceAlreadyInformal() {
    const { publicService } = this.model;
    yield this.publicServiceService.confirmInstanceAlreadyInformal(
      publicService
    );
  }

  @action
  convertToInformal() {
    this.modals.open(ConfirmConvertToInformalModalComponent, {
      convertToInformalHandler: async () => {
        let { publicService } = this.model;
        await this.publicServiceService.convertInstanceToInformal(
          publicService
        );
        this.router.refresh('public-services.details');
      },
    });
  }
  @action
  fullyTakeConceptSnapshotOver() {
    this.modals.open(FullyTakeConceptSnapshotOverModalComponent, {
      fullyTakeConceptSnapshotOverHandler: async () => {
        let { publicService } = this.model;
        await this.publicServiceService.fullyTakeConceptSnapshotOver(
          publicService
        );
        this.router.refresh('public-services.details');
      },
      updateConceptSnapshotByFieldHandler: async () => {
        let { readOnly, publicService } = this.model;
        if (readOnly) {
          await this.publicServiceService.reopenPublicService(publicService);
          this.router.refresh('public-services.details');
        }
      },
    });
  }

  hasUnsavedChangesObserver(aValue) {
    this.formHasUnsavedChanges = aValue;
  }
}
