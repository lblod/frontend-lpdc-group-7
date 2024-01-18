import Service, { inject as service } from '@ember/service';

export default class ConceptService extends Service {
  @service store;

  async loadConceptDetails(conceptId) {
    return this.store.findRecord('conceptual-public-service', conceptId, {
      include:
        'type,status,display-configuration,concept-tags,target-audiences,competent-authority-levels,executing-authority-levels',
    });
  }

  async loadConceptLanguageVersion(conceptId) {
    const response = await fetch(
      `/lpdc-management/conceptual-public-services/${conceptId}/dutch-language-version`
    );
    return (await response.json()).languageVersion;
  }

  async loadAllConcepts({ search, page, sort, isNewConcept, isInstantiated }) {
    let query = {
      'filter[:has-no:status]': 'yes',
      'page[number]': page,
      'fields[conceptual-public-services]':
        'name,display-configuration,product-id,type,target-audiences,competent-authority-levels,concept-tags',
      include:
        'display-configuration,target-audiences,concept-tags,competent-authority-levels,type',
    };

    if (search) {
      query['filter'] = search.trim();
    }

    if (typeof isNewConcept === 'boolean') {
      query['filter[display-configuration][is-new-concept]'] = isNewConcept;
    }

    if (typeof isInstantiated === 'boolean') {
      query['filter[display-configuration][is-instantiated]'] = isInstantiated;
    }

    if (sort) {
      query.sort = sort;
    }

    return await this.store.query('conceptual-public-service', query);
  }
}
