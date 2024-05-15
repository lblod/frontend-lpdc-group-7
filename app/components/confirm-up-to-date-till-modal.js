import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class ConfirmUpToDateTillModal extends Component {
  @dropTask
  *confirmUpToDateTill() {
    yield this.args.data.confirmUpToDateTillHandler();
    this.args.close();
  }

  @action
  close() {
    if (this.confirmUpToDateTill.isIdle) {
      this.args.close();
    }
  }
}
