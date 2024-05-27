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
    const path = this.args.data.instanceForm.formStore.any(
      this.args.data.field.uri,
      new NamedNode('http://www.w3.org/ns/shacl#path'),
      undefined,
      this.args.data.instanceForm.graphs.formGraph
    );

    const valueLiteral = this.args.data.instanceForm.formStore.any(
      this.args.data.instanceForm.sourceNode,
      path,
      undefined,
      this.args.data.instanceForm.graphs.sourceGraph
    );

    this.args.data.saveHandler(valueLiteral);
    this.close();
  }
}
