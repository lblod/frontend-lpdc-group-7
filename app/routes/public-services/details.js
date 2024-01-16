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

    const languageVersionOfConcept = publicService.concept.id
      ? await this.conceptService.loadConceptLanguageVersion(
          publicService.concept.id
        )
      : undefined;

    const publicServiceLanguageVersion =
      await this.publicServiceService.loadPublicServiceLanguageVersion(
        publicService.id
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
