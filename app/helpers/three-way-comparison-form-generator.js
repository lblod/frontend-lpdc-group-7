import { EXT, FORM, RDF, SHACL } from 'frontend-lpdc/rdf/namespaces';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { Literal, Statement } from 'rdflib';

export default class ThreeWayComparisonFormGenerator {
  storeOptions;

  constructor(originalStoreOptions) {
    this.storeOptions = originalStoreOptions;
  }

  getForms(originalFormFieldUri) {
    const instanceForm = this.createFormStoreForField(
      originalFormFieldUri,
      'Instantie'
    );
    const conceptSnapshotCurrent = this.createFormStoreForField(
      originalFormFieldUri,
      'Concept waarop instantie is gebaseerd '
    );

    const conceptSnapshotLatest = this.createFormStoreForField(
      originalFormFieldUri,
      `Meest recente concept`
    );

    return {
      instance: {
        form: instanceForm.form,
        sourceNode: this.storeOptions.sourceNode,
        graphs: this.getGraphs(),
        formStore: instanceForm.formStore,
        originalFormFieldTitle: instanceForm.originalFormFieldTitle,
      },
      conceptSnapshotCurrent: {
        form: conceptSnapshotCurrent.form,
        sourceNode: this.getSourceNode('current'),
        graphs: this.getGraphs(),
        formStore: conceptSnapshotCurrent.formStore,
        originalFormFieldTitle: conceptSnapshotCurrent.originalFormFieldTitle,
      },
      conceptSnapshotLatest: {
        form: conceptSnapshotLatest.form,
        sourceNode: this.getSourceNode('latest'),
        graphs: this.getGraphs(),
        formStore: conceptSnapshotLatest.formStore,
        originalFormFieldTitle: conceptSnapshotLatest.originalFormFieldTitle,
      },
    };
  }

  getFormNode() {
    return this.storeOptions.store.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      this.storeOptions.formGraph
    );
  }

  getSourceNode(type) {
    return this.storeOptions.store.any(
      this.storeOptions.sourceNode,
      type === 'current'
        ? EXT('comparisonSourceCurrent')
        : EXT('comparisonSourceLatest'),
      undefined,
      this.storeOptions.metaGraph
    );
  }

  getGraphs() {
    return {
      formGraph: this.storeOptions.formGraph,
      sourceGraph: this.storeOptions.sourceGraph,
      metaGraph: this.storeOptions.metaGraph,
    };
  }

  createFormStoreForField(fieldIri, newFieldTitle) {
    const { formTriples, form, originalFormFieldTitle } =
      this.createFormTriples(fieldIri, newFieldTitle, this.storeOptions);
    const sourceTriples = this.createSourceTriples(this.storeOptions);
    const metaTriples = this.createMetaTriples(this.storeOptions);
    const formStore = new ForkingStore();
    formStore.addAll([...formTriples, ...sourceTriples, ...metaTriples]);
    return {
      formStore: formStore,
      form: form,
      originalFormFieldTitle: originalFormFieldTitle,
    };
  }

  createFormTriples(fieldIri, newFieldTitle) {
    let originalFormFieldTitle;
    const formFieldTriples = this.storeOptions.store
      .match(fieldIri, undefined, undefined, undefined)
      .map((triple) => {
        if (triple.predicate.value === SHACL('name').value) {
          originalFormFieldTitle = triple.object.value;
          return new Statement(
            triple.subject,
            triple.predicate,
            new Literal(newFieldTitle),
            triple.graph
          );
        }
        return triple;
      });

    const formIri = EXT('three-way-comparison-form');
    const form = [
      new Statement(
        formIri,
        RDF('type'),
        FORM('Form'),
        this.storeOptions.formGraph
      ),
      new Statement(
        formIri,
        RDF('type'),
        FORM('TopLevelForm'),
        this.storeOptions.formGraph
      ),
      new Statement(
        formIri,
        FORM('includes'),
        fieldIri,
        this.storeOptions.formGraph
      ),
    ];

    const groupIri = this.storeOptions.store.any(
      fieldIri,
      SHACL('group'),
      undefined,
      this.storeOptions.formGraph
    );

    const group = this.storeOptions.store.match(
      groupIri,
      RDF('type'),
      undefined,
      this.storeOptions.formGraph
    );

    const validationIds = this.storeOptions.store.match(
      fieldIri,
      FORM('validations'),
      undefined,
      this.storeOptions.formGraph
    );

    const validations = validationIds.flatMap((v) =>
      this.storeOptions.store.match(v.object, undefined, undefined, undefined)
    );

    return {
      formTriples: [...form, ...formFieldTriples, ...group, ...validations],
      form: formIri,
      originalFormFieldTitle: originalFormFieldTitle,
    };
  }

  createSourceTriples() {
    const source = this.storeOptions.store.match(
      undefined,
      undefined,
      undefined,
      this.storeOptions.sourceGraph
    );

    const conceptSnapshotSource = this.storeOptions.store
      .match(undefined, undefined, undefined, this.storeOptions.metaGraph)
      .map(
        (t) =>
          new Statement(
            t.subject,
            t.predicate,
            t.object,
            this.storeOptions.sourceGraph
          )
      );
    return [...source, ...conceptSnapshotSource];
  }

  createMetaTriples() {
    return this.storeOptions.store.match(
      undefined,
      undefined,
      undefined,
      this.storeOptions.metaGraph
    );
  }
}
