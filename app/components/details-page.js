import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  ForkingStore,
  validateForm,
} from '@lblod/ember-submission-form-fields';
import { NamedNode } from 'rdflib';
import { dropTask, dropTaskGroup, task } from 'ember-concurrency';
import ConfirmDeletionModal from 'frontend-lpdc/components/confirm-deletion-modal';
import ConfirmReopeningModal from 'frontend-lpdc/components/confirm-reopening-modal';
import ConfirmSubmitModal from 'frontend-lpdc/components/confirm-submit-modal';
import UnsavedChangesModal from 'frontend-lpdc/components/unsaved-changes-modal';
import { FORM, RDF } from 'frontend-lpdc/rdf/namespaces';
import ConfirmBijgewerktTotModal from 'frontend-lpdc/components/confirm-bijgewerkt-tot-modal';

const FORM_GRAPHS = {
  formGraph: new NamedNode('http://data.lblod.info/form'),
  metaGraph: new NamedNode('http://data.lblod.info/metagraph'),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

export default class DetailsPageComponent extends Component {
  @service modals;
  @service router;
  @service store;
  @service toaster;
  @service('public-service') publicServiceService;

  @tracked hasUnsavedChanges = false;
  @tracked forceShowErrors = false;
  @tracked form;

  id = guidFor(this);
  @tracked formStore;
  graphs = FORM_GRAPHS;

  constructor() {
    super(...arguments);
    this.loadForm.perform();
    this.sourceNode = new NamedNode(this.args.publicService.uri);

    if (!this.args.readOnly) {
      this.router.on('routeWillChange', this, this.showUnsavedChangesModal);
    }
  }

  get isInitialized() {
    return this.loadForm.last.isSuccessful;
  }

  get canSubmit() {
    return this.isInitialized && this.publicServiceAction.isIdle;
  }

  get canSave() {
    return (
      this.isInitialized &&
      this.hasUnsavedChanges &&
      this.publicServiceAction.isIdle
    );
  }

  @task
  * loadForm() {
    const {
      form: formTtl,
      meta: metaTtl,
      source: sourceTtl,
    } = yield fetchFormGraphs(this.args.publicService.uri, this.args.formId);

    let formStore = new ForkingStore();
    formStore.parse(formTtl, FORM_GRAPHS.formGraph, 'text/turtle');
    formStore.parse(metaTtl, FORM_GRAPHS.metaGraph, 'text/turtle');
    formStore.parse(sourceTtl, FORM_GRAPHS.sourceGraph, 'text/turtle');

    let form = formStore.any(
      undefined,
      RDF('type'),
      FORM('Form'),
      FORM_GRAPHS.formGraph
    );

    if (!this.args.readOnly) {
      formStore.registerObserver(this.updateFormDirtyState, this.id);
    }

    this.form = form;
    this.formStore = formStore;
    this.hasUnsavedChanges = false;
  }

  @action
  updateFormDirtyState(/* delta */) {
    // TODO: we can probably make this logic smarter so that reverting to the original saved state doesn't trigger a false positive
    this.hasUnsavedChanges = true;
  }

  @dropTaskGroup publicServiceAction;

  @task({group: 'publicServiceAction'})
  *publishPublicService() {
    const { publicService } = this.args;
    try {
      const response = yield validateFormData(publicService.uri);

      if (response.ok) {
        yield this.publicServiceService.publishInstance(publicService);

        this.router.transitionTo('public-services');
      } else {
        const jsonResponse = yield response.json();
        const errors = jsonResponse?.data?.errors;

        if (response.status == 500 || !errors) {
          throw 'Unexpected error while validating data in backend';
        } else {
          for (const error of errors) {
            //TODO: should probably handle this more in a more user friendly way
            //ie: redirect to said form and scroll down to the first invalid field
            this.toaster.error(error.message, 'Fout');
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.toaster.error(
        `Onverwachte fout bij het verwerken van het product, gelieve de helpdesk te contacteren.
         Foutboodschap: ${error.message || error}`,
        'Fout'
      );
    }
  }

  @task({ group: 'publicServiceAction' })
  *handleFormSubmit(event) {
    event?.preventDefault?.();

    try {
      yield this.saveSemanticForm.unlinked().perform();

      if (this.args.publicService.reviewStatus) {
        yield this.modals.open(ConfirmBijgewerktTotModal, {
          confirmBijgewerktTotHandler: async () => {
            await this.publicServiceService.confirmBijgewerktTotLatestFunctionalChange(
              this.args.publicService
            );
          },
        });
      }
    } catch (error) {
      console.error(error);
      this.toaster.error(
        `Onverwachte fout bij het bewaren van het formulier, gelieve de helpdesk te contacteren.
         Foutboodschap: ${error.message || error}`,
        'Fout'
      );
    }
  }

  @dropTask
  *saveSemanticForm() {
    try {
      let { publicService, formId } = this.args;
      let serializedData = this.formStore.serializeDataWithAddAndDelGraph(
        this.graphs.sourceGraph,
        'application/n-triples'
      );

      yield saveFormData(publicService.uri, formId, serializedData);
      yield this.publicServiceService.loadPublicServiceDetails(
        publicService.id
      );
      yield this.loadForm.perform();
    } catch (error) {
      this.toaster.error(error.message, 'Fout');
    }
  }

  @dropTask
  *requestSubmitConfirmation() {
    let isValidForm = validateForm(this.form, {
      ...this.graphs,
      sourceNode: this.sourceNode,
      store: this.formStore,
    });
    this.forceShowErrors = !isValidForm;

    if (this.hasUnsavedChanges) {
      yield this.saveSemanticForm.unlinked().perform();
    }

    if (isValidForm) {
      if (this.args.publicService.reviewStatus) {
        yield this.modals.open(ConfirmBijgewerktTotModal, {
          confirmBijgewerktTotHandler: async () => {
            await this.publicServiceService.confirmBijgewerktTotLatestFunctionalChange(
              this.args.publicService
            );
          },
        });
      }

      yield this.modals.open(ConfirmSubmitModal, {
        submitHandler: async () => {
          await this.publishPublicService.perform();
        },
      });
    } else {
      this.toaster.error('Formulier is ongeldig', 'Fout');
    }
  }

  @action
  requestReopeningConfirmation() {
    this.modals.open(ConfirmReopeningModal, {
      reopeningHandler: async () => {
        let { publicService } = this.args;
        await this.publicServiceService.reopenPublicService(publicService);

        this.router.refresh('public-services.details');
      },
    });
  }

  @action
  removePublicService() {
    this.modals.open(ConfirmDeletionModal, {
      deleteHandler: async () => {
        try {
          await this.publicServiceService.deletePublicService(
            this.args.publicService.uri
          );
          this.hasUnsavedChanges = false;
          this.router.replaceWith('public-services');
        } catch (error) {
          console.error(error);
          this.toaster.error(
            `Onverwachte fout bij het verwijderen van het product, gelieve de helpdesk te contacteren.
             Foutboodschap: ${error.message || error}`,
            'Fout'
          );
        }
      },
    });
  }

  async showUnsavedChangesModal(transition) {
    if (transition.isAborted) {
      return;
    }

    if (this.hasUnsavedChanges) {
      transition.abort();

      const { shouldTransition, saved } = await this.modals.open(
        UnsavedChangesModal,
        {
          saveHandler: async () => {
            await this.saveSemanticForm.perform();
          },
        }
      );

      if (this.args.publicService.reviewStatus && saved) {
        await this.modals.open(ConfirmBijgewerktTotModal, {
          confirmBijgewerktTotHandler: async () => {
            await this.publicServiceService.confirmBijgewerktTotLatestFunctionalChange(
              this.args.publicService
            );
          },
        });
      }

      if (shouldTransition) {
        this.hasUnsavedChanges = false;
        transition.retry();
      }
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);

    if (!this.args.readOnly) {
      this.formStore?.deregisterObserver(this.id);
      this.router.off('routeWillChange', this, this.showUnsavedChangesModal);
    }
  }
}

async function fetchFormGraphs(serviceId, formId) {
  const response = await fetch(
    `/lpdc-management/public-services/${encodeURIComponent(
      serviceId
    )}/form/${formId}`
  );
  return await response.json();
}

async function saveFormData(serviceId, formId, formData) {
  const response = await fetch(
    `/lpdc-management/public-services/${encodeURIComponent(
      serviceId
    )}/form/${formId}`,
    {
      method: 'PUT',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }
  );
  if (!response.ok) {
    const message = await response.json();
    console.error(message);
    throw new Error(message.message);
  }
}

async function validateFormData(serviceId) {
  return await fetch(
    `/lpdc-management/public-services/${encodeURIComponent(
      serviceId
    )}/validate-for-publish`,
    {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }
  );
}
