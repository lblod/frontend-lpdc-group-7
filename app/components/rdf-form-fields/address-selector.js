import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { updateSimpleFormValue } from '@lblod/submission-form-helpers';
import { action } from '@ember/object';
import { Literal, NamedNode } from 'rdflib';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { guidFor } from '@ember/object/internals';

export default class AddressSelectorComponent extends InputFieldComponent {
  id = '-' + guidFor(this);
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
  initialObjectAdresId;

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
    this.initialObjectAdresId = triples.find(
      (triple) => triple.predicate.value === predicates.hasAdresId
    )?.object;
  }

  get canValidateAddress() {
    return !!this.municipality && !!this.street && !!this.houseNumber;
  }

  get canUpdateStreet() {
    return !this.args.show && !!this.municipality;
  }

  get canUpdateHouseNumber() {
    return !this.args.show && !!this.municipality && !!this.street;
  }

  get canUpdateBusNumber() {
    return (
      !this.args.show &&
      !!this.municipality &&
      !!this.street &&
      !!this.houseNumber
    );
  }

  createObjectFromValue(value, language) {
    return value ? new Literal(value, language) : null;
  }

  @action
  updateMunicipality(value) {
    this.updateStreet(null);
    this.updateHouseNumber(null);
    this.updateBusNumber(null);
    this.municipality = value;
    this.updateMunicipalityTriple();
    this.validateAddress.perform();
  }

  @action
  updateStreet(value) {
    this.updateHouseNumber(null);
    this.updateBusNumber(null);
    this.street = value;
    this.updateStreetTriple();
    this.validateAddress.perform();
  }

  @action
  updateHouseNumber(event) {
    const value = event && event.target.value;
    this.updateBusNumber(null);
    this.houseNumber = value && value.trim();
    this.updateHouseNumberTriple();
    this.validateAddress.perform();
  }

  @action
  updateBusNumber(event) {
    const value = event && event.target.value;
    this.busNumber = value && value.trim();
    this.updateBusNumberTriple();
    this.validateAddress.perform();
  }

  @restartableTask
  *validateAddress() {
    yield timeout(250);
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
      if (result.adressenRegisterId) {
        this.updatePostcodeTriple(result.postcode);
        this.updateCountryTriple();
        this.updateAddressRegisterIdTriple(result.adressenRegisterId);
      } else {
        this.updateCountryTriple(null);
        this.updatePostcodeTriple(null);
        this.updateAddressRegisterIdTriple(null);
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
    const newObject = this.createObjectFromValue(this.municipality, 'nl');
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
    const newObject = this.createObjectFromValue(this.street, 'nl');
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

  updateCountryTriple(country) {
    const newObject = this.createObjectFromValue(
      country === null ? undefined : 'België',
      'nl'
    );
    this.updateField(predicates.country, newObject, this.initialObjectCountry);
    this.initialObjectCountry = newObject;
  }

  updateAddressRegisterIdTriple(addressRegisterId) {
    const newObject = addressRegisterId
      ? new NamedNode(addressRegisterId)
      : null;
    this.updateField(
      predicates.hasAdresId,
      newObject,
      this.initialObjectAdresId
    );
    this.initialObjectAdresId = newObject;
  }

  updateField(path, newObject, originalObject) {
    const storeOptions = {
      ...this.storeOptions,
      path: new NamedNode(path),
    };
    updateSimpleFormValue(storeOptions, newObject, originalObject);
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
  hasAdresId: 'https://data.vlaanderen.be/ns/adres#verwijstNaar',
};
