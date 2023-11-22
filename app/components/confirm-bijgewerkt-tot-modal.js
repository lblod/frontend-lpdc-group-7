import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class ConfirmBijgewerktTotModal extends Component {
  @dropTask
  *confirmBijgewerktTot() {
    yield this.args.data.confirmBijgewerktTotHandler();
    this.args.close();
  }

  @action
  close() {
    if (this.confirmBijgewerktTot.isIdle) {
      this.args.close();
    }
  }
}
