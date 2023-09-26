import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { updateSimpleFormValue } from '@lblod/submission-form-helpers';
import { action } from '@ember/object';
import { Literal, NamedNode } from 'rdflib';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';

export default class AddressSelectorComponent extends InputFieldComponent {
  @tracked municipality;
  @tracked street;
  @tracked houseNumber;
  @tracked busNumber;

  streets = ['Kerkstraat', 'Dorp', 'Pleinstraat'];

  initialObjectMunicipality;
  initialObjectStreet;
  initialObjectHouseNumber;
  initialObjectBusNumber;

  constructor() {
    super(...arguments);

    this.loadProvidedValue();
  }

  loadProvidedValue() {
    const store = this.storeOptions.store;

    const triples = store.match(
      this.storeOptions.sourceNode,
      undefined,
      undefined,
      undefined
    );

    this.initialObjectMunicipality = triples.find(
      (triple) => triple.predicate.value === predicates.municipality
    )?.object;
    this.municipality = this.initialObjectMunicipality?.value;
    this.initialObjectStreet = triples.find(
      (triple) => triple.predicate.value === predicates.street
    )?.object;
    this.street = this.initialObjectStreet?.value;
    this.initialObjectHouseNumber = triples.find(
      (triple) => triple.predicate.value === predicates.houseNumber
    )?.object;
    this.houseNumber = this.initialObjectHouseNumber?.value;
    this.initialObjectBusNumber = triples.find(
      (triple) => triple.predicate.value === predicates.busNumber
    )?.object;
    this.busNumber = this.initialObjectBusNumber?.value;
  }

  @action
  updateMunicipality(value) {
    const newObject = this.createObjectFromValue(value);
    this.updateField(
      predicates.municipality,
      newObject,
      this.initialObjectMunicipality
    );
    this.municipality = newObject?.value;
    this.initialObjectMunicipality = newObject;
  }

  @action
  updateStreet(value) {
    const newObject = this.createObjectFromValue(value);
    this.updateField(predicates.street, newObject, this.initialObjectStreet);
    this.street = newObject?.value;
    this.initialObjectStreet = newObject;
  }

  @action
  updateHouseNumber() {
    const houseNumber = this.houseNumber && this.houseNumber.trim();
    const newObject = this.createObjectFromValue(houseNumber);
    this.updateField(
      predicates.houseNumber,
      newObject,
      this.initialObjectHouseNumber
    );
    this.houseNumber = newObject?.value;
    this.initialObjectHouseNumber = newObject;
  }

  @action
  updateBusNumber() {
    const busNumber = this.busNumber && this.busNumber.trim();
    const newObject = this.createObjectFromValue(busNumber);
    this.updateField(
      predicates.busNumber,
      newObject,
      this.initialObjectBusNumber
    );
    this.busNumber = newObject?.value;
    this.initialObjectBusNumber = newObject;
  }

  updateField(path, newObject, originalObject) {
    const storeOptions = {
      ...this.storeOptions,
      path: new NamedNode(path),
    };

    updateSimpleFormValue(storeOptions, newObject, originalObject);
  }

  createObjectFromValue(value) {
    return value ? new Literal(value, 'nl') : null;
  }

  @restartableTask
  *searchMunicipalities(searchString) {
    yield timeout(250);
    const response = yield fetch(
      `/lpdc-management/address/municipalities?search=${searchString}`
    );
    return yield response.json();
  }
}

const predicates = {
  municipality: 'https://data.vlaanderen.be/ns/adres#gemeentenaam',
  street: 'https://data.vlaanderen.be/ns/adres#Straatnaam',
  houseNumber:
    'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer',
  busNumber: 'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer',
};
