import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ThreeWayCompareModal from 'frontend-lpdc/components/three-way-compare-modal';
import ThreeWayComparisonFormGenerator from 'frontend-lpdc/helpers/three-way-comparison-form-generator';
import { EXT } from 'frontend-lpdc/rdf/namespaces';

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
    return (
      this.args.visible &&
      this.formGenerator.getFormNode().value === EXT('form').value &&
      this.formGenerator.getSourceNode('current') &&
      this.formGenerator.getSourceNode('latest')
    );
  }
}
