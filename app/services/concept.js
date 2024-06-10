import Service, { inject as service } from '@ember/service';
import { HttpRequest } from 'frontend-lpdc/helpers/http-request';

export default class ConceptService extends Service {
  @service store;
  @service toaster;

  httpRequest = new HttpRequest(this.toaster);

  async loadConceptDetails(conceptId) {
    return this.store.findRecord('conceptual-public-service', conceptId, {
      reload: true,
      include: 'type,status,display-configuration,target-audiences',
    });
  }

  async getConceptForm(serviceId, formId) {
    return this.httpRequest.get(
      `/lpdc-management/conceptual-public-services/${encodeURIComponent(
        serviceId
      )}/form/${formId}`
    );
  }

  async loadConceptLanguageVersionByConceptUri(conceptUri) {
    const responseBody = await this.httpRequest.get(
      `/lpdc-management/conceptual-public-services/${encodeURIComponent(
        conceptUri
      )}/dutch-language-version`
    );
    return responseBody.languageVersion;
  }

  async loadAllConcepts({
    search,
    page,
    sort,
    isNewConcept,
    isNotInstantiated,
    isInstantiated,
    isYourEurope,
  }) {
    let query = {
      'filter[:has-no:status]': 'yes',
      'page[number]': page,
      'fields[conceptual-public-services]':
        'name,display-configuration,product-id,type,target-audiences,thematic-areas,publication-media',
      include:
        'display-configuration,type,target-audiences,thematic-areas,publication-media',
    };

    if (search) {
      query['filter'] = search.trim();
    }

    if (isNewConcept) {
      query['filter[display-configuration][is-new-concept]'] = isNewConcept;
    }

    if (isNotInstantiated === true) {
      query['filter[display-configuration][is-instantiated]'] =
        !isNotInstantiated;
    }

    //TODO LPDC-1186: remove ...
    if (typeof isInstantiated === 'boolean') {
      query['filter[display-configuration][is-instantiated]'] = isInstantiated;
    }

    if (isYourEurope) {
      query['filter[publication-media][:uri:]'] =
        'https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/YourEurope';
    }

    if (sort) {
      query.sort = sort;
    }

    return await this.store.query('conceptual-public-service', query);
  }

  async removeIsNewConceptFlag(conceptDisplayConfiguration) {
    await this.httpRequest.put(
      `/lpdc-management/concept-display-configuration/${encodeURIComponent(
        conceptDisplayConfiguration.uri
      )}/remove-is-new-flag`
    );
  }
}
