import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ThreeWayCompareModal from 'frontend-lpdc/components/three-way-compare-modal';
import ThreeWayComparisonFormGenerator from 'frontend-lpdc/helpers/three-way-comparison-form-generator';
import { EXT } from 'frontend-lpdc/rdf/namespaces';
import { NamedNode } from 'rdflib';
import { isEqual } from 'lodash';

export default class ThreeWayCompareLinkComponent extends Component {
  @service modals;
  formGenerator = new ThreeWayComparisonFormGenerator(
    this.args.originalStoreOptions
  );

  @action
  openModal() {
    const { instance, conceptSnapshotCurrent, conceptSnapshotLatest } =
      this.formGenerator.getForms(this.args.field.uri);
    this.modals.open(ThreeWayCompareModal, {
      field: this.args.field,
      instanceForm: instance,
      conceptSnapshotCurrentForm: conceptSnapshotCurrent,
      conceptSnapshotLatestForm: conceptSnapshotLatest,
      fieldName: instance.originalFormFieldTitle,
      saveHandler: (valueLiteral) => {
        this.args.updateValue(valueLiteral.value);
      },
    });
  }

  get visible() {
    const currentSnapshotValues =
      this.formGenerator.getSortedLiteralValuesForPath(
        this.formGenerator.getSourceNode('current'),
        new NamedNode(this.args.field.path)
      );
    const latestSnapshotValues =
      this.formGenerator.getSortedLiteralValuesForPath(
        this.formGenerator.getSourceNode('latest'),
        new NamedNode(this.args.field.path)
      );

    return (
      this.args.visible &&
      this.formGenerator.getFormNode().value === EXT('form').value &&
      this.formGenerator.getSourceNode('current') &&
      this.formGenerator.getSourceNode('latest') &&
      !isEqual(currentSnapshotValues.sort(), latestSnapshotValues.sort())
    );
  }
}
