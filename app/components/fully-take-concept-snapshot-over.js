import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class FullyTakeConceptSnapshotOverModalComponent extends Component {
  @dropTask
  *fullyTakeConceptSnapshotOver() {
    yield this.args.data.fullyTakeConceptSnapshotOverHandler();
    this.args.close();
  }

  @dropTask
  *updateConceptSnapshotByField() {
    yield this.args.data.updateConceptSnapshotByFieldHandler();
    this.args.close();
  }

  @action
  close() {
    this.args.close();
  }
}
