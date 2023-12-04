import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class UnsavedChangesModalComponent extends Component {
  @dropTask
  *save() {
    yield this.args.data.saveHandler();

    this.args.close({ shouldTransition: true, saved: true });
  }

  @action
  discardChanges() {
    if (this.save.isIdle) {
      this.args.close({ shouldTransition: true, saved: false });
    }
  }

  @action
  cancel() {
    if (this.save.isIdle) {
      this.args.close({ shouldTransition: false, saved: false });
    }
  }
}
