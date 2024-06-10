import { inject as service } from '@ember/service';
import { hasConcept } from 'frontend-lpdc/models/public-service';
import AbstractConceptOverviewRoute from 'frontend-lpdc/routes/public-services/abstract-concept-overview-route';

export default class PublicServicesLinkConceptRoute extends AbstractConceptOverviewRoute {
  @service store;
  @service router;
  @service('public-service') publicServiceService;
  @service('concept') conceptService;

  async model(params) {
    const publicService =
      await this.publicServiceService.loadPublicServiceDetails(
        params.serviceId
      );

    if (hasConcept(publicService)) {
      return this.router.replaceWith(
        'public-services.details',
        publicService.id
      );
    }

    return {
      publicService,
      loadConceptualPublicServices:
        this.loadConceptualPublicServicesTask.perform(params),
      loadDoelgroepenOptions: await this.loadDoelgroepenConcepts.perform(),
      loadProducttypesOptions: await this.producttypesConcepts.perform(),
      loadThemasOptions: await this.themasConcepts.perform(),
    };
  }
}
