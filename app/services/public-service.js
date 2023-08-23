import Service, { inject as service } from '@ember/service';

export default class PublicServiceService extends Service {
  @service store;

  async bestuurseenheidHasPublicServices() {
    const query = { 'page[size]': 1, 'page[number]': 0 };
    const publicServices = await this.store.query('public-service', query);
    return publicServices.length !== 0;
  }
}
