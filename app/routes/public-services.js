import { warn } from '@ember/debug';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { registerFormFields } from '@lblod/ember-submission-form-fields';
import ConceptSelector from 'frontend-lpdc/components/rdf-form-fields/concept-selector';
import RichTextEditor from 'frontend-lpdc/components/rdf-form-fields/rich-text-editor';
import TagSelector from 'frontend-lpdc/components/rdf-form-fields/tag-selector';
import SelectWithCreate from 'frontend-lpdc/components/rdf-form-fields/select-with-create';
import AddressSelector from 'frontend-lpdc/components/rdf-form-fields/address-selector';
import LpdcInputComponent from 'frontend-lpdc/components/rdf-form-fields/lpdc-input';
import LpdcDateTimeComponent from 'frontend-lpdc/components/rdf-form-fields/lpdc-date-time';
import LpdcRdfInputFieldsConceptSchemeMultiSelectorComponent from 'frontend-lpdc/components/rdf-form-fields/lpdc-concept-scheme-multi-selector';
import LpdcRdfHeadingComponent from 'frontend-lpdc/components/rdf-form-fields/lpdc-heading';
import { task } from 'ember-concurrency';

export default class PublicServicesRoute extends Route {
  @service currentSession;
  @service session;
  @service router;
  @service store;

  constructor() {
    super(...arguments);

    this.registerCustomFormFields();
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    return this.loadCurrentSession();
  }

  async model() {
    return {
      loadStatusesOptions: await this.statutesConcepts.perform(),
      loadProducttypesOptions: await this.producttypesConcepts.perform(),
      loadDoelgroepenOptions: await this.loadDoelgroepenConcepts.perform(),
      loadThemasOptions: await this.themasConcepts.perform(),
    };
  }

  async loadCurrentSession() {
    try {
      await this.currentSession.load();
    } catch (error) {
      warn(error, { id: 'current-session-load-failure' });
      this.router.transitionTo('auth.logout');
    }
  }

  registerCustomFormFields() {
    registerFormFields([
      {
        displayType: 'http://lblod.data.gift/display-types/richText',
        edit: RichTextEditor,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/conceptSelector',
        edit: ConceptSelector,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/tagSelector',
        edit: TagSelector,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/selectWithCreate',
        edit: SelectWithCreate,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/addressSelector',
        edit: AddressSelector,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/lpdcInput',
        edit: LpdcInputComponent,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/lpdcDateTime',
        edit: LpdcDateTimeComponent,
      },
      {
        displayType:
          'http://lblod.data.gift/display-types/lpdcConceptSchemeMultiSelector',
        edit: LpdcRdfInputFieldsConceptSchemeMultiSelectorComponent,
      },
      {
        displayType: 'http://lblod.data.gift/display-types/lpdcHeading',
        edit: LpdcRdfHeadingComponent,
      },
    ]);
  }

  @task
  *statutesConcepts() {
    return yield this.store.query('concept', {
      'filter[concept-schemes][:uri:]':
        'http://lblod.data.gift/concept-schemes/9cf6fa63-1f49-4d53-af06-e1c235ece10b',
      sort: 'label',
    });
  }

  @task
  *producttypesConcepts() {
    return yield this.store.query('concept', {
      'filter[concept-schemes][:uri:]':
        'https://productencatalogus.data.vlaanderen.be/id/conceptscheme/Type',
      sort: 'label',
    });
  }

  @task
  *loadDoelgroepenConcepts() {
    return yield this.store.query('concept', {
      'filter[concept-schemes][:uri:]':
        'https://productencatalogus.data.vlaanderen.be/id/conceptscheme/Doelgroep',
      sort: 'label',
    });
  }

  @task
  *themasConcepts() {
    return yield this.store.query('concept', {
      'filter[concept-schemes][:uri:]':
        'https://productencatalogus.data.vlaanderen.be/id/conceptscheme/Thema',
      sort: 'label',
    });
  }
}
