import { action } from '@ember/object';
import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';

export default class ConfirmConvertToInformalModalComponent extends Component {
  @dropTask
  *convertToInformal() {
    yield this.args.data.convertToInformalHandler();
    this.args.close();
  }

  @action
  close() {
    this.args.close();
  }
}
