import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lpdc/tests/helpers';
import { click, render, settled, doubleClick } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import SelectUOrJeModal from 'frontend-lpdc/components/select-u-or-je-modal';
import { timeout } from 'ember-concurrency';

const MODAL = {
  ELEMENT: '[data-test-select-u-or-je-modal=modal]',
  SUBMIT_BUTTON: '[data-test-select-u-or-je-modal=submit-button]',
  CANCEL_BUTTON: '[data-test-select-u-or-je-modal=cancel-button]',
  ERROR_MESSAGE: '[data-test-select-u-or-je-modal=error-message]',
  SELECT: '[data-test-select-u-or-je-modal=select]',
};

module('Integration | Component | select-u-or-je-modal', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    const modalService = this.owner.lookup('service:modals');
    await render(hbs`<AuModalContainer /><EpmModalContainer />`);

    modalService.open(SelectUOrJeModal, {
      submitHandler: () => {},
      makeChoiceLaterHandler: () => {},
    });

    await settled();
    assert.dom(MODAL.ELEMENT).exists();
  });

  test('it shows error message when no selection is made when clicking on submit button', async function (assert) {
    const modalsService = this.owner.lookup('service:modals');

    await render(hbs`<AuModalContainer /><EpmModalContainer />`);
    modalsService.open(SelectUOrJeModal, {
      submitHandler: () => {},
      makeChoiceLaterHandler: () => {},
    });

    await settled();
    const submitButton = document.querySelector(MODAL.SUBMIT_BUTTON);
    await click(submitButton);

    assert.dom(MODAL.ERROR_MESSAGE).exists();
  });

  test("Submit handler is called with 'formal' when 'formal' is selected", async function (assert) {
    const modalsService = this.owner.lookup('service:modals');

    await render(hbs`<AuModalContainer /><EpmModalContainer />`);
    modalsService.open(SelectUOrJeModal, {
      submitHandler: (value) => {
        assert.step(`submitted with value: ${value}`);
      },
      makeChoiceLaterHandler: () => {},
    });

    await settled();
    const radioU = document.querySelector('input[name=formal]');
    await click(radioU);
    const submitButton = document.querySelector(MODAL.SUBMIT_BUTTON);
    await click(submitButton);

    assert
      .dom(MODAL.ELEMENT)
      .doesNotExist('it closes the modal after the submit succeeded');

    assert.verifySteps(['submitted with value: formal']);
  });

  test("submit handler is called with 'informal' when 'informal' is selected", async function (assert) {
    const modalsService = this.owner.lookup('service:modals');

    await render(hbs`<AuModalContainer /><EpmModalContainer />`);
    modalsService.open(SelectUOrJeModal, {
      submitHandler: (value) => {
        assert.step(`submitted with value: ${value}`);
      },
      makeChoiceLaterHandler: () => {},
    });

    await settled();
    const radio = document.querySelector('input[name=informal]');
    await click(radio);
    const submitButton = document.querySelector(MODAL.SUBMIT_BUTTON);
    await click(submitButton);

    assert
      .dom(MODAL.ELEMENT)
      .doesNotExist('it closes the modal after the submit succeeded');

    assert.verifySteps(['submitted with value: informal']);
  });

  test("it doesn't call the submit handler when modal is closed without clicking the submit button", async function (assert) {
    const modalsService = this.owner.lookup('service:modals');

    await render(hbs`<AuModalContainer /><EpmModalContainer />`);
    modalsService.open(SelectUOrJeModal, {
      submitHandler: () => {
        assert.step('submitted');
      },
      makeChoiceLaterHandler: () => {
        assert.step('choose later');
      },
    });

    await settled();
    const cancelButton = document.querySelector(MODAL.CANCEL_BUTTON);
    await click(cancelButton);
    assert.dom(MODAL.ELEMENT).doesNotExist();
    assert.verifySteps(['choose later']);
  });

  test('it ignores modal close requests while the submit handler is running', async function (assert) {
    const modalsService = this.owner.lookup('service:modals');
    let count = 0;

    await render(hbs`<AuModalContainer /><EpmModalContainer />`);
    modalsService.open(SelectUOrJeModal, {
      submitHandler: async () => {
        await timeout(100);
        assert.step(`submitted: ${count}`);
        count++;
      },
      makeChoiceLaterHandler: () => {},
    });

    await settled();

    const radio = document.querySelector('input[name=informal]');
    await click(radio);
    const submitButton = document.querySelector(MODAL.SUBMIT_BUTTON);
    await doubleClick(submitButton);

    assert.dom(MODAL.ELEMENT).doesNotExist();
    assert.verifySteps(['submitted: 0']);
  });
});
