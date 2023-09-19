import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import SimpleInputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/simple-value-input-field';
import { guidFor } from '@ember/object/internals';

export default class SelectWithCreateComponent extends SimpleInputFieldComponent {
  @tracked
  options = [];
  id = 'select-with-create-' + guidFor(this);

  constructor() {
    super(...arguments);
    this.loadOptions();
  }
  @action
  isValueValid(value) {
    return value.trim().length > 0;
  }

  @action
  createSuggestion(value) {
    return `Voeg '${value.trim()}' toe`;
  }

  @action
  createOption(newOption) {
    this.options = [...this.options, newOption.trim()];
    this.value = newOption.trim();
    this.updateStore();
  }

  @action
  updateOption(newOption) {
    this.value = newOption;
    this.updateStore();
  }

  async loadOptions() {
    const field = this.storeOptions.path.value.split('http://schema.org/')[1];
    const response = await fetch(
      `/lpdc-management/contact-info-options/${field}`
    );
    this.options = await response.json();
  }

  updateStore() {
    super.updateValue(this.value);
  }
}
