import Component from '@glimmer/component';

const STATUS_LOOKUP = {
  'http://lblod.data.gift/concepts/instance-status/ontwerp': {
    skin: 'warning',
    label: 'Ontwerp',
  },

  'http://lblod.data.gift/concepts/instance-status/verzonden': {
    skin: 'success',
    label: 'Verzonden',
  },
};

export default class Status extends Component {
  get label() {
    return STATUS_LOOKUP[this.args.uri]?.label;
  }
  get statusSkin() {
    return STATUS_LOOKUP[this.args.uri]?.skin;
  }
}
