import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ConceptualPublicServiceModel extends Model {
  @attr uri;
  @attr productId;
  @attr('language-string-set') name;
  @attr('datetime') startDate;
  @attr('datetime') endDate;
  @attr('datetime') dateCreated;
  @attr('datetime') dateModified;
  @attr versionedSource;
  @attr hasLatestFunctionalChange;

  @belongsTo('concept', {
    async: false,
    inverse: null,
  })
  type;

  @belongsTo('concept', {
    async: false,
    inverse: null,
  })
  status;

  @belongsTo('concept-display-configuration', {
    async: false,
    inverse: null,
  })
  displayConfiguration;

  @hasMany('concept', {
    async: false,
    inverse: null,
  })
  targetAudiences;

  @hasMany('concept', {
    async: false,
    inverse: null,
  })
  thematicAreas;

  @hasMany('concept', {
    async: false,
    inverse: null,
  })
  publicationMedia;

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
