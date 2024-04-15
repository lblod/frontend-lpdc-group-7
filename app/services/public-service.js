import Service, { inject as service } from '@ember/service';
import { HttpRequest } from 'frontend-lpdc/helpers/http-request';
import moment from 'moment';

export default class PublicServiceService extends Service {
  @service store;
  @service('concept') conceptService;
  @service toaster;

  httpRequest = new HttpRequest(this.toaster);

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

  async updatePublicService(publicService, formData) {
    await this.httpRequest.put(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}`,
      formData,
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );
  }

  async getPublicServiceForm(serviceId, formId) {
    return this.httpRequest.get(
      `/lpdc-management/public-services/${encodeURIComponent(
        serviceId
      )}/form/${formId}`
    );
  }

  async unlinkConcept(publicService) {
    await this.httpRequest.put(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/ontkoppelen`,
      {},
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );
    await this.loadPublicServiceDetails(publicService.id);
  }

  async linkConcept(publicService, concept) {
    await this.httpRequest.put(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/koppelen/${encodeURIComponent(concept.uri)}`,
      {},
      {
        test: 'test',
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );
    await this.loadPublicServiceDetails(publicService.id);
  }

  async confirmBijgewerktTotLatestFunctionalChange(publicService) {
    await this.httpRequest.post(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/confirm-bijgewerkt-tot`,
      {
        bijgewerktTot: publicService.concept.get('hasLatestFunctionalChange'),
      },
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );

    await this.loadPublicServiceDetails(publicService.id);
  }

  async confirmInstanceAlreadyFormal(publicService) {
    await this.httpRequest.post(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/confirm-instance-is-already-informal`,
      {},
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );

    await this.loadPublicServiceDetails(publicService.id);
  }

  async createPublicService(conceptId) {
    const responseBody = await this.httpRequest.post(
      '/lpdc-management/public-services',
      conceptId ? { conceptId: conceptId } : {}
    );
    return responseBody.data.id;
  }

  async deletePublicService(publicServiceId) {
    await this.httpRequest.delete(
      `/lpdc-management/public-services/${encodeURIComponent(publicServiceId)}`
    );
  }

  async reopenPublicService(publicService) {
    await this.httpRequest.put(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/reopen`,
      {},
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );
    await this.loadPublicServiceDetails(publicService.id);
  }

  async validateInstance(publicService) {
    return await this.httpRequest.put(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/validate-for-publish`,
      {},
      {
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );
  }

  async publishInstance(publicService) {
    await this.httpRequest.put(
      `/lpdc-management/public-services/${encodeURIComponent(
        publicService.uri
      )}/publish`,
      {},
      {
        test: 'test',
        'instance-version': moment(publicService.dateModified).toISOString(),
      }
    );
    await this.loadPublicServiceDetails(publicService.id);
  }
}
