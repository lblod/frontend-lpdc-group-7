import Service, { inject as service } from '@ember/service';
import { HttpRequest } from 'frontend-lpdc/helpers/http-request';

export default class ConceptSnapshotService extends Service {
  @service store;
  @service toaster;

  httpRequest = new HttpRequest(this.toaster);

  async getFunctionallyChangedFields(conceptSnapshot) {
    return this.httpRequest.get(
      `/lpdc-management/concept-snapshot/compare-with-latest/${encodeURIComponent(
        conceptSnapshot
      )}`
    );
  }
}
