import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import config from 'frontend-lpdc/config/environment';

export default class ApplicationController extends Controller {
  @service session;
  @service currentSession;
  @service router;

  appTitle = 'Lokale Producten- en Dienstencatalogus';
  loketUrl = !config.loketUrl.startsWith('{{') ? config.loketUrl : null;
}
