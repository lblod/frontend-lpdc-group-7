import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { loadPublicServiceDetails } from 'frontend-lpdc/utils/public-services';
import { loadConceptLanguageVersion } from 'frontend-lpdc/utils/concept';

export default class PublicServicesDetailsRoute extends Route {
  @service store;

  async model({ serviceId }) {
    const publicService = await loadPublicServiceDetails(this.store, serviceId);
    const readOnly =
      publicService.status.uri !==
      'http://lblod.data.gift/concepts/79a52da4-f491-4e2f-9374-89a13cde8ecd';

    const languageVersionOfConcept = publicService.concept.id
      ? await loadConceptLanguageVersion(publicService.concept.id)
      : undefined;

    return {
      publicService,
      readOnly,
      languageVersionOfConcept,
    };
  }

  setupController(controller, { publicService }) {
    super.setupController(...arguments);

    controller.reviewStatus = publicService.reviewStatus;
  }
}
