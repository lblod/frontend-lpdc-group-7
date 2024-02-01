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

  async unlinkConcept(publicService) {
    await fetch(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/ontkoppelen`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    await this.loadPublicServiceDetails(publicService.id);
  }

  async linkConcept(publicService, concept) {
    await fetch(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/koppelen/${encodeURIComponent(concept.uri)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    await this.loadPublicServiceDetails(publicService.id);
  }

  async loadPublicServiceLanguageVersion(publicServiceUri) {
    const response = await fetch(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicServiceUri
      )}/dutch-language-version`,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    const body = await response.json();
    return body?.languageVersion;
  }

  async confirmBijgewerktTotLatestFunctionalChange(publicService) {
    await fetch(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/confirm-bijgewerkt-tot`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          bijgewerktTot: publicService.concept.get('hasLatestFunctionalChange'),
        }),
      }
    );
    await this.loadPublicServiceDetails(publicService.id);
  }

  async createPublicService(conceptId) {
    const body = conceptId ? { conceptId: conceptId } : {};

    const response = await fetch('/lpdc-management/public-services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(body),
    });

    const publicService = await response.json();
    return publicService.data.id;
  }

  async deletePublicService(publicServiceId) {
    await fetch(
      `/lpdc-management/public-services/${encodeURIComponent(publicServiceId)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
  }

  async reopenPublicService(publicService) {
    await fetch(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/reopen`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    await this.loadPublicServiceDetails(publicService.id);
  }

  async publishInstance(publicService) {
    await fetch(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/publish`
    );
    await this.loadPublicServiceDetails(publicService.id);
  }
}
