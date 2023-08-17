import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ConceptualPublicServiceModel extends Model {
  @attr uri;
  @attr productId;
  @attr('language-string-set') name;
  @attr('datetime') startDate;
  @attr('datetime') endDate;
  @attr('datetime') created;
  @attr('datetime') modified;

  @belongsTo('concept', {
    async: true,
    inverse: null,
  })
  type;

  @belongsTo('concept', {
    inverse: null,
    async: false,
  })
  status;

  @belongsTo('concept-display-configuration', {
    inverse: null,
    async: false,
  })
  displayConfiguration;

  @hasMany('concept', {
    async: true,
    inverse: null,
  })
  conceptTags;

  @hasMany('concept', {
    async: true,
    inverse: null,
  })
  targetAudiences;

  @hasMany('concept', {
    async: true,
    inverse: null,
  })
  competentAuthorityLevels;

  @hasMany('concept', {
    async: true,
    inverse: null,
  })
  executingAuthorityLevels;

  get nameNl() {
    if (!this.name?.length) {
      return null;
    }
    const nameNl = this.name.find((name) => name.language === 'nl')?.content;
    const nl = this.name.find((name) =>
      name.language.startsWith('nl')
    )?.content;
    const fallBack = this.name[0].content;
    return nameNl ?? nl ?? fallBack;
  }
}
