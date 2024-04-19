import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class ConfirmConvertToInformalModalComponent extends Component {
  // @dropTask
  // *delete() {
  //   this.args.close();
  // }

  @action
  close() {
    this.args.close();
  }
}
