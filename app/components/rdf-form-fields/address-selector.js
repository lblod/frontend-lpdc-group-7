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
  @tracked validatedAddress;

  initialObjectMunicipality;
  initialObjectPostcode;
  initialObjectStreet;
  initialObjectHouseNumber;
  initialObjectBusNumber;
  initialObjectCountry;

  constructor() {
    super(...arguments);

    this.loadProvidedValue();
    this.validateAddress.perform();
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
    this.initialObjectPostcode = triples.find(
      (triple) => triple.predicate.value === predicates.postcode
    )?.object;
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
    this.initialObjectCountry = triples.find(
      (triple) => triple.predicate.value === predicates.country
    )?.object;
  }

  @action
  updateMunicipality(value) {
    this.updateStreet(null);
    this.updateHouseNumber(null);
    this.updateBusNumber(null);
    this.municipality = value;
    this.validateAddress.perform();
  }

  @action
  updateStreet(value) {
    this.updateHouseNumber(null);
    this.updateBusNumber(null);
    this.street = value;
    this.validateAddress.perform();
  }

  @action
  updateHouseNumber(value) {
    this.houseNumber = value && value.trim();
    this.validateAddress.perform();
  }

  @action
  updateBusNumber(value) {
    this.busNumber = value && value.trim();
    this.validateAddress.perform();
  }

  get canUpdateStreet() {
    return !!this.municipality;
  }

  get canUpdateHouseNumber() {
    return !!this.municipality && !!this.street;
  }

  get canUpdateBusNumber() {
    return !!this.municipality && !!this.street && !!this.houseNumber;
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
  *validateAddress() {
    if (this.municipality && this.street && this.houseNumber) {
      const busNumberQueryParam = this.busNumber
        ? `&busNumber=${this.busNumber}`
        : '';
      const queryParams = `municipality=${this.municipality}&street=${this.street}&houseNumber=${this.houseNumber}${busNumberQueryParam}`;
      const response = yield fetch(
        `/lpdc-management/address/validate?${queryParams}`
      );
      const result = yield response.json();
      this.validatedAddress = result.volledigAdres;
      if (result.volledigAdres) {
        this.updateMunicipalityTriple();
        this.updatePostcodeTriple(result.postcode);
        this.updateStreetTriple();
        this.updateHouseNumberTriple();
        this.updateBusNumberTriple();
        this.updateCountryTriple();
      }
    } else {
      this.validatedAddress = undefined;
    }
  }

  @restartableTask
  *searchMunicipalities(searchString) {
    yield timeout(250);
    const response = yield fetch(
      `/lpdc-management/address/municipalities?search=${searchString}`
    );
    return yield response.json();
  }

  @restartableTask
  *searchStreets(searchString) {
    yield timeout(250);
    const response = yield fetch(
      `/lpdc-management/address/streets?municipality=${this.municipality}&search=${searchString}`
    );
    return yield response.json();
  }

  updateMunicipalityTriple() {
    const newObject = this.createObjectFromValue(this.municipality);
    this.updateField(
      predicates.municipality,
      newObject,
      this.initialObjectMunicipality
    );
    this.initialObjectMunicipality = newObject;
  }

  updatePostcodeTriple(postcode) {
    const newObject = this.createObjectFromValue(postcode);
    this.updateField(
      predicates.postcode,
      newObject,
      this.initialObjectPostcode
    );
    this.initialObjectPostcode = newObject;
  }

  updateStreetTriple() {
    const newObject = this.createObjectFromValue(this.street);
    this.updateField(predicates.street, newObject, this.initialObjectStreet);
    this.initialObjectStreet = newObject;
  }

  updateHouseNumberTriple() {
    const newObject = this.createObjectFromValue(this.houseNumber);
    this.updateField(
      predicates.houseNumber,
      newObject,
      this.initialObjectHouseNumber
    );
    this.initialObjectHouseNumber = newObject;
  }

  updateBusNumberTriple() {
    const newObject = this.createObjectFromValue(this.busNumber);
    this.updateField(
      predicates.busNumber,
      newObject,
      this.initialObjectBusNumber
    );
    this.initialObjectBusNumber = newObject;
  }

  updateCountryTriple() {
    const newObject = this.createObjectFromValue('België');
    this.updateField(predicates.country, newObject, this.initialObjectCountry);
    this.initialObjectCountry = newObject;
  }
}

const predicates = {
  municipality: 'https://data.vlaanderen.be/ns/adres#gemeentenaam',
  postcode: 'https://data.vlaanderen.be/ns/adres#postcode',
  street: 'https://data.vlaanderen.be/ns/adres#Straatnaam',
  houseNumber:
    'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer',
  busNumber: 'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer',
  country: 'https://data.vlaanderen.be/ns/adres#land',
};
