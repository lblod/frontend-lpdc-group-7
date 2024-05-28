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
    const valueLiterals = this.args.data.instanceForm.formStore
      .match(
        this.args.data.instanceForm.sourceNode,
        new NamedNode(this.args.data.field.path),
        undefined,
        this.args.data.instanceForm.graphs.sourceGraph
      )
      .map((t) => t.object.value);

    this.args.data.saveHandler(valueLiterals);
    this.close();
  }
}
