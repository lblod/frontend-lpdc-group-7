import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { createMockService } from 'frontend-lpdc/tests/helpers';

module('Unit | Service | formal-informal-choice', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(() => {
    localStorage.clear();
  });

  test('Service is created', function (assert) {
    const service = this.owner.lookup('service:formalInformalChoice');
    assert.notEqual(service, undefined);
  });

  test('makeChoiceLater should create item in localstorage', function (assert) {
    const service = this.owner.lookup('service:formalInformalChoice');
    service.makeChoiceLater();

    assert.strictEqual(
      localStorage.getItem('makeFormalInformalChoiceLater'),
      'true'
    );
  });

  test('enableChoiceIfNotPreviouslyConfirmed should remove item from localstorage', function (assert) {
    localStorage.setItem('makeFormalInformalChoiceLater', 'true');

    const service = this.owner.lookup('service:formalInformalChoice');
    service.enableChoiceIfNotPreviouslyConfirmed();

    assert.strictEqual(
      localStorage.getItem('makeFormalInformalChoiceLater'),
      null
    );
  });

  test('save choice should save choice', function (assert) {
    let calledWithValue;
    createMockService(this, 'service:store', {
      createRecord: (model, object) => {
        calledWithValue = object;
        return {
          save: () => {},
        };
      },
    });

    this.owner.lookup('service:formalInformalChoice').saveChoice('formal');

    assert.strictEqual(calledWithValue?.chosenForm, 'formal');
    assert.notEqual(calledWithValue?.dateCreated, undefined);
  });

  test('isChoiceMade should return true when choice saved in backend', async function (assert) {
    createMockService(this, 'service:store', {
      findAll: () => [{ chosenForm: 'formal' }],
    });

    const service = this.owner.lookup('service:formalInformalChoice');
    assert.true(await service.isChoiceMade());
  });

  test('isChoiceMade should return true when chooseLater in localstorage', async function (assert) {
    createMockService(this, 'service:store', {
      findAll: () => [],
    });

    localStorage.setItem('makeFormalInformalChoiceLater', 'true');
    const service = this.owner.lookup('service:formalInformalChoice');
    assert.true(await service.isChoiceMade());
  });

  test('isChoiceMade should return false no chooseLater in localstorage and no choice saved in backend', async function (assert) {
    createMockService(this, 'service:store', {
      findAll: () => [],
    });
    const service = this.owner.lookup('service:formalInformalChoice');
    assert.false(await service.isChoiceMade());
  });
});
