import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hasConcept } from 'frontend-lpdc/models/public-service';

export default class PublicServicesLinkConceptRoute extends Route {
  @service router;
  @service('public-service') publicServiceService;

  async model({ serviceId }) {
    const publicService =
      await this.publicServiceService.loadPublicServiceDetails(serviceId);

    if (hasConcept(publicService)) {
      return this.router.replaceWith(
        'public-services.details',
        publicService.id
      );
    }

    return {
      publicService,
    };
  }
}
