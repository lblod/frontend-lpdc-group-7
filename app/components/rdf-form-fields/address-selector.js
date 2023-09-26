import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { updateSimpleFormValue } from '@lblod/submission-form-helpers';
import { action } from '@ember/object';
import { Literal, NamedNode } from 'rdflib';

export default class AddressSelectorComponent extends InputFieldComponent {
  municipality;
  street;
  houseNumber;
  busNumber;

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
  updateMunicipality() {
    const municipality = this.municipality && this.municipality.trim();

    this.updateField(
      predicates.municipality,
      municipality,
      this.initialObjectMunicipality
    );
    this.loadProvidedValue();
  }

  @action
  updateStreet() {
    const street = this.street && this.street.trim();
    this.updateField(predicates.street, street, this.initialObjectStreet);
    this.loadProvidedValue();
  }

  @action
  updateHouseNumber() {
    const houseNumber = this.houseNumber && this.houseNumber.trim();
    this.updateField(
      predicates.houseNumber,
      houseNumber,
      this.initialObjectHouseNumber
    );
    this.loadProvidedValue();
  }

  @action
  updateBusNumber() {
    const busNumber = this.busNumber && this.busNumber.trim();
    this.updateField(
      predicates.busNumber,
      busNumber,
      this.initialObjectBusNumber
    );
    this.loadProvidedValue();
  }

  updateField(path, newValue, originalObject) {
    const storeOptions = {
      ...this.storeOptions,
      path: new NamedNode(path),
    };

    const newObject = newValue ? new Literal(newValue, 'nl') : null;

    updateSimpleFormValue(storeOptions, newObject, originalObject);
  }
}

const predicates = {
  municipality: 'https://data.vlaanderen.be/ns/adres#gemeentenaam',
  street: 'https://data.vlaanderen.be/ns/adres#Straatnaam',
  houseNumber:
    'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer',
  busNumber: 'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer',
};
