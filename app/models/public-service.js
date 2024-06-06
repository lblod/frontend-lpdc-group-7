import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { isEmpty, trim } from 'lodash';

export default class PublicServiceModel extends Model {
  @attr uri;
  @attr productId;
  @attr('language-string-set') name;
  @attr('datetime') startDate;
  @attr('datetime') endDate;
  @attr('datetime') dateCreated;
  @attr('datetime') dateModified;
  @attr versionedSource;
  @attr dutchLanguageVariant;
  @attr needsConversionFromFormalToInformal;

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

  @belongsTo('concept', {
    async: false,
    inverse: null,
  })
  publicationStatus;

  get isSent() {
    return (
      this.status?.uri ===
      'http://lblod.data.gift/concepts/instance-status/verstuurd'
    );
  }

  get isPublished() {
    return (
      this.publicationStatus?.uri ===
      'http://lblod.data.gift/concepts/publication-status/gepubliceerd'
    );
  }

  get isYourEurope() {
    for (let medium of this.publicationMedia) {
      if (
        medium.uri ===
        'https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/YourEurope'
      ) {
        return true;
      }
    }
    return false;
  }

  get nameNl() {
    if (!this.name?.length) {
      return undefined;
    }
    const nameNl = this.name.find((name) => name.language === 'nl')?.content;
    const nl = this.name.find((name) =>
      name.language.startsWith('nl')
    )?.content;
    const fallBack = this.name[0].content;
    return nameNl ?? nl ?? fallBack;
  }

  get nameNlOrGeenTitel() {
    const result = this.nameNl;

    return isEmpty(trim(result)) ? '(geen titel)' : result;
  }
}

export function serviceNeedsReview(publicService) {
  return Boolean(publicService.reviewStatus);
}

const REVIEW_STATUS = {
  UPDATED: 'http://lblod.data.gift/concepts/review-status/concept-gewijzigd',
  DELETED: 'http://lblod.data.gift/concepts/review-status/concept-gearchiveerd',
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
