import Model, { attr, belongsTo } from '@ember-data/model';

export default class FormalInformalChoice extends Model {
  @attr chosenForm;
  @attr dateCreated;
  @attr uri;

  @belongsTo('bestuurseenheid', { async: true, inverse: null }) bestuurseenheid;
}
