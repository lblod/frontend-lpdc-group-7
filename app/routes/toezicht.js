import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend( AuthenticatedRouteMixin, {
  currentSession: service(),

  beforeModel() {
    if (!this.currentSession.canAccessToezicht){
      this.transitionTo('index');
    } else if(this.currentSession._group.submissionTrialUser){
      this.transitionTo('supervision.submissions.index');
    }
  }
});
