import Component from '@glimmer/component';
import { action } from '@ember/object';
import { NamedNode } from 'rdflib';

export default class ThreeWayCompareModalComponent extends Component {
  @action
  close() {
    this.args.close();
  }

  @action
  save() {
    const valueLiteral = this.args.data.instanceForm.formStore.any(
      this.args.data.instanceForm.sourceNode,
      new NamedNode(this.args.data.field.path),
      undefined,
      this.args.data.instanceForm.graphs.sourceGraph
    );

    this.args.data.saveHandler(valueLiteral);
    this.close();
  }
}
