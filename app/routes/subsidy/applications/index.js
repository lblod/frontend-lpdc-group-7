/* eslint-disable ember/no-mixins */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import { ROLES } from 'frontend-loket/models/participation';

export default class SubsidyApplicationsIndexRoute extends Route.extend(DataTableRouteMixin) {
  @service('current-session') currentSessionService;
  modelName = 'subsidy-measure-consumption';

  mergeQueryOptions() {
    let groupId = this.currentSessionService.groupContent.id;
    return {
      include: [
        'status',
        'subsidy-measure-offer',
        'subsidy-application-flow.subsidy-measure-offer-series.period',
        'participations',
        'last-modifier',
      ].join(','),
      filter: {
        participations: {
          "participating-bestuurseenheid": {
            ":id:": groupId,
          },
          ":exact:role": ROLES.APPLICANT
        }
      }
    };
  }
}
