import BaseSessionService from 'ember-simple-auth/services/session';

export default class SessionService extends BaseSessionService {
  get isMockLoginSession() {
    return this.isAuthenticated
      ? this.data.authenticated.authenticator.includes('mock-login')
      : false;
  }

  handleInvalidation() {
    // We don't want the default redirecting logic of the base class since we handle this ourselves in other places already.
    // We can't do the logic here since we don't know which authenticator did the invalidation and we don't receive the arguments that are passed to `.invalidate` either.
    // This is needed to be able to support both normal logouts, switch logouts (and as a bonus,also mock logouts).
  }
}
