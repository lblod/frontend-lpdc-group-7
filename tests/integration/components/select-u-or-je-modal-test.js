import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lpdc/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | select-u-or-je-modal', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<SelectUOrJeModal />`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      <SelectUOrJeModal>
        template block text
      </SelectUOrJeModal>
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
