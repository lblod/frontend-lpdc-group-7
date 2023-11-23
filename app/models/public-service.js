import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class PublicServiceModel extends Model {
  @attr uri;
  @attr productId;
  @attr('language-string-set') name;
  @attr('datetime') startDate;
  @attr('datetime') endDate;
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr versionedSource;

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

  @hasMany('concept', {
    async: false,
    inverse: null,
  })
  conceptTags;

  @hasMany('concept', {
    async: false,
    inverse: null,
  })
  targetAudiences;

  @hasMany('concept', {
    async: false,
    inverse: null,
  })
  competentAuthorityLevels;

  @hasMany('concept', {
    async: false,
    inverse: null,
  })
  executingAuthorityLevels;

  @belongsTo('conceptual-public-service', {
    async: true,
    inverse: null,
  })
  concept;

  @belongsTo('concept', {
    async: false,
    inverse: null,
  })
  reviewStatus;

  get isSent() {
    return (
      this.status?.uri ===
      'http://lblod.data.gift/concepts/9bd8d86d-bb10-4456-a84e-91e9507c374c'
    );
  }

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

export function serviceNeedsReview(publicService) {
  return Boolean(publicService.reviewStatus);
}

const REVIEW_STATUS = {
  UPDATED:
    'http://lblod.data.gift/concepts/5a3168e2-f39b-4b5d-8638-29f935023c83',
  DELETED:
    'http://lblod.data.gift/concepts/cf22e8d1-23c3-45da-89bc-00826eaf23c3',
};

export function isConceptUpdated(reviewStatus) {
  return reviewStatus?.uri === REVIEW_STATUS.UPDATED;
}

export function isConceptDeleted(reviewStatus) {
  return reviewStatus?.uri === REVIEW_STATUS.DELETED;
}

export function hasConcept(publicService) {
  // This assumes the relationship was already loaded. Either by using includes, or by resolving the promise.
  // Otherwise this will always return false
  return Boolean(publicService.belongsTo('concept').id());
}
