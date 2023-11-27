import Service, { inject as service } from '@ember/service';

export default class PublicServiceService extends Service {
  @service store;
  @service('concept') conceptService;

  async bestuurseenheidHasPublicServices() {
    const query = { 'page[size]': 1, 'page[number]': 0 };
    const publicServices = await this.store.query('public-service', query);
    return publicServices.length !== 0;
  }

  async loadPublicServiceDetails(publicServiceId) {
    return this.store.findRecord('public-service', publicServiceId, {
      reload: true,
      include:
        'type,status,concept-tags,target-audiences,competent-authority-levels,executing-authority-levels,concept,review-status',
    });
  }

  async unlinkConcept(publicServiceId) {
    await fetch(
      `/lpdc-management/public-services/${publicServiceId}/ontkoppelen`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    await this.loadPublicServiceDetails(publicServiceId);
  }

  async linkConcept(publicServiceId, conceptId) {
    await fetch(
      `/lpdc-management/public-services/${publicServiceId}/koppelen/${conceptId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    await this.loadPublicServiceDetails(publicServiceId);
  }

  async loadPublicServiceLanguageVersion(publicServiceId) {
    const response = await fetch(
      `/lpdc-management/public-services/${publicServiceId}/language-version`,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    const body = await response.json();
    return body?.languageVersion;
  }

  async confirmBijgewerktTot(publicServiceId, snapshotUri) {
    await fetch(
      `/lpdc-management/public-services/${publicServiceId}/confirm-bijgewerkt-tot`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ bijgewerktTot: snapshotUri }),
      }
    );
    await this.loadPublicServiceDetails(publicServiceId);
  }

  async createPublicService(conceptId) {
    const publicService = this.store.createRecord('public-service');

    if (conceptId) {
      const concept = await this.conceptService.loadConceptDetails(conceptId);
      publicService.concept = concept;
    }

    await publicService.save();
    return publicService.id;
  }
}
