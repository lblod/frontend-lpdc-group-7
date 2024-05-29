import Component from '@glimmer/component';
import { NamedNode } from 'rdflib';
import ThreeWayComparisonFormGenerator from 'frontend-lpdc/helpers/three-way-comparison-form-generator';

export default class LpdcRdfHeadingComponent extends Component {
  get skin() {
    return this.args.field.options.skin;
  }

  get level() {
    return this.args.field.options.level;
  }

  get pillText() {
    return this.args.field.options.pillText;
  }

  get showPill() {
    const formGenerator = new ThreeWayComparisonFormGenerator({
      store: this.args.formStore,
      sourceNode: this.args.sourceNode,
      formGraph: this.args.formStore.formGraph,
      metaGraph: this.args.formStore.metaGraph,
      sourceGraph: this.args.formStore.sourceGraph,
    });
    const countConceptSnapshotCurrent = this.args.formStore.match(
      formGenerator.getSourceNode('current'),
      new NamedNode(this.args.field.options.path),
      undefined,
      formGenerator.getGraphs().metaGraph
    ).length;
    const countConceptSnapshotLatest = this.args.formStore.match(
      formGenerator.getSourceNode('latest'),
      new NamedNode(this.args.field.options.path),
      undefined,
      formGenerator.getGraphs().metaGraph
    ).length;

    return countConceptSnapshotLatest !== countConceptSnapshotCurrent;
  }
}
