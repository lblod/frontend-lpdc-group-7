import { inject as service } from '@ember/service';
import AbstractConceptOverviewRoute from 'frontend-lpdc/routes/public-services/abstract-concept-overview-route';

export default class PublicServicesAddRoute extends AbstractConceptOverviewRoute {
  @service store;
  @service formalInformalChoice;
  @service('concept') conceptService;

  async model(params) {
    return {
      loadConceptualPublicServices:
        this.loadConceptualPublicServicesTask.perform(params),
      formalInformalChoice: await this.formalInformalChoice.getChoice(),
      loadDoelgroepenOptions: await this.loadDoelgroepenConcepts.perform(),
      loadProducttypesOptions: await this.producttypesConcepts.perform(),
      loadThemasOptions: await this.themasConcepts.perform(),
    };
  }
}
