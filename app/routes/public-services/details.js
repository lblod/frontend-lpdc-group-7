import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicServicesDetailsRoute extends Route {
  @service('public-service') publicServiceService;
  @service('concept') conceptService;

  async model({ serviceId }) {
    const publicService =
      await this.publicServiceService.loadPublicServiceDetails(serviceId);
    const readOnly =
      publicService.status.uri !==
      'http://lblod.data.gift/concepts/instance-status/ontwerp';

    const concept = publicService.concept.id
      ? await this.conceptService.loadConceptDetails(publicService.concept.id)
      : undefined;

    const languageVersionOfConcept = concept
      ? await this.conceptService.loadConceptLanguageVersionByConceptUri(
          concept.uri
        )
      : undefined;

    const publicServiceLanguageVersion =
      await this.publicServiceService.loadPublicServiceLanguageVersion(
        publicService.uri
      );

    return {
      publicService,
      readOnly,
      languageVersionOfConcept,
      publicServiceLanguageVersion,
    };
  }

  setupController(controller, { publicService }) {
    super.setupController(...arguments);

    controller.reviewStatus = publicService.reviewStatus;
  }
}
