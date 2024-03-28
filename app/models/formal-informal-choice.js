import Model, { attr } from '@ember-data/model';

export default class FormalInformalChoice extends Model {
  @attr chosenForm;
  @attr dateCreated;
  @attr uri;
}
