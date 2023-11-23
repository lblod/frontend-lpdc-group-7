import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicServicesNewRoute extends Route {
  @service store;
  @service router;
  @service('concept') conceptService;

  model({ concept: conceptId }) {
    // We intentionally don't return a promise here so the normal route template is rendered instantly
    // This allows us to show a breadcrumb since our current breadcrumb setup doesn't support loading states
    this.createPublicService(conceptId);
  }

  async createPublicService(conceptId) {
    let publicService = this.store.createRecord('public-service');

    if (conceptId) {
      const concept = await this.conceptService.loadConceptDetails(conceptId);
      publicService.concept = concept;
    }

    await publicService.save();
    this.router.transitionTo('public-services.details', publicService.id);
  }
}
