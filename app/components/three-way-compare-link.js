import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ThreeWayCompareModal from 'frontend-lpdc/components/three-way-compare-modal';
import { NamedNode } from 'rdflib';
import { FORM, RDF } from 'frontend-lpdc/rdf/namespaces';
import { ForkingStore } from '@lblod/ember-submission-form-fields';

export default class ThreeWayCompareLinkComponent extends Component {
  @service modals;
  form;
  formStore;

  @action
  openModal() {
    this.loadForm();

    this.modals.open(ThreeWayCompareModal, {
      field: this.args.field,
      form: this.form,
      formStore: this.formStore,
      graphs: {
        formGraph: this.args.originalStoreOptions.formGraph,
        sourceGraph: this.args.originalStoreOptions.sourceGraph,
        metaGraph: this.args.originalStoreOptions.metaGraph,
      },
      sourceNode: this.args.originalStoreOptions.sourceNode,
      saveHandler: (valueLiteral) => {
        this.args.updateValue(valueLiteral.value);
      },
    });
  }

  loadForm() {
    const formField = this.args.originalStoreOptions.store.match(
      this.args.field.uri,
      undefined,
      undefined,
      undefined
    );

    const formDef = this.args.originalStoreOptions.store.match(
      new NamedNode('http://mu.semte.ch/vocabularies/ext/form'),
      new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      undefined,
      undefined
    );

    const formFieldLinkToForm = this.args.originalStoreOptions.store.match(
      new NamedNode('http://mu.semte.ch/vocabularies/ext/form'),
      new NamedNode('http://lblod.data.gift/vocabularies/forms/includes'),
      this.args.field.uri,
      undefined
    );

    const groupIri = formField.filter(
      (s) => s.predicate.value === 'http://www.w3.org/ns/shacl#group'
    )[0].object;

    const group = this.args.originalStoreOptions.store.match(
      groupIri,
      undefined,
      undefined,
      undefined
    );

    this.form = this.args.originalStoreOptions.store.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      new NamedNode('http://data.lblod.info/form')
    );

    const source = this.args.originalStoreOptions.store.match(
      undefined,
      undefined,
      undefined,
      new NamedNode(`http://data.lblod.info/sourcegraph`)
    );

    const validationId = this.args.originalStoreOptions.store.any(
      this.args.field.uri,
      new NamedNode('http://lblod.data.gift/vocabularies/forms/validations'),
      undefined,
      undefined
    );

    const validations = this.args.originalStoreOptions.store.match(
      validationId,
      undefined,
      undefined,
      undefined
    );

    const formDefinition = [
      ...formDef,
      ...formFieldLinkToForm,
      ...group,
      ...formField,
      ...validations,
    ];

    this.formStore = new ForkingStore();
    const allTriples = [...formDefinition, ...source];
    this.formStore.addAll(allTriples);
  }
}
