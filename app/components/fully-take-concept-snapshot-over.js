import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class FullyTakeConceptSnapshotOverModalComponent extends Component {
  @dropTask
  *fullyTakeConceptSnapshotOver() {
    this.args.close();
  }

  @action
  close() {
    if (this.fullyTakeConceptSnapshotOver.isIdle) {
      this.args.close();
    }
  }
}
