import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ContextService extends Service {
  @tracked parentContext = null;

  setParentContext(context) {
    this.parentContext = context;
  }

  getParentContext() {
    return this.parentContext;
  }
}
