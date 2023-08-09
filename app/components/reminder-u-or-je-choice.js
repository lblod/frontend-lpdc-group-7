import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ReminderUOrJeChoiceComponent extends Component {
  get isFormal() {
    return this.args.chosenForm === 'formal';
  }
  get isInformal() {
    return this.args.chosenForm === 'informal';
  }

  @action
  openSelectUOrJeModal() {
    this.args.openSelectModal();
  }
}
