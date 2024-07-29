import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import {
  inputRules,
  ProseParser,
  Schema,
  Selection,
} from '@lblod/ember-rdfa-editor';
import {
  blockRdfaWithConfig,
  docWithConfig,
  hard_break,
  horizontal_rule,
  invisibleRdfaWithConfig,
  paragraph,
  repairedBlockWithConfig,
  text,
} from '@lblod/ember-rdfa-editor/nodes'; // check
import { inline_rdfa } from '@lblod/ember-rdfa-editor/marks';
import { chromeHacksPlugin } from '@lblod/ember-rdfa-editor/plugins/chrome-hacks-plugin';
import { firefoxCursorFix } from '@lblod/ember-rdfa-editor/plugins/firefox-cursor-fix';
import {
  em,
  strikethrough,
  strong,
  subscript,
  superscript,
  underline,
} from '@lblod/ember-rdfa-editor/plugins/text-style'; // check
import {
  tableKeymap,
  tableNodes,
  tablePlugin,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';
import { link, linkView } from '@lblod/ember-rdfa-editor/plugins/link';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { lastKeyPressedPlugin } from '@lblod/ember-rdfa-editor/plugins/last-key-pressed';
import {
  bulletListWithConfig,
  listItemWithConfig,
  listTrackingPlugin,
  orderedListWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/list';
import {
  bullet_list_input_rule,
  ordered_list_input_rule,
} from '@lblod/ember-rdfa-editor/plugins/list/input_rules';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import SimpleInputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/simple-value-input-field';

export default class RdfFormFieldsRichTextEditorComponent extends SimpleInputFieldComponent {
  @tracked editorController;
  inputId = 'richtext-' + guidFor(this);

  nodeViews = (controller) => {
    return {
      link: linkView(this.linkOptions)(controller),
    };
  };

  schema = new Schema({
    nodes: {
      doc: docWithConfig(),
      paragraph,

      repaired_block: repairedBlockWithConfig(),

      list_item: listItemWithConfig({ enableHierarchicalList: true }),
      ordered_list: orderedListWithConfig({ enableHierarchicalList: true }),
      bullet_list: bulletListWithConfig({ enableHierarchicalList: true }),
      placeholder,
      ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
      heading: headingWithConfig(),
      blockquote,

      horizontal_rule,
      code_block,

      text,

      image,

      hard_break,
      invisible_rdfa: invisibleRdfaWithConfig(),
      block_rdfa: blockRdfaWithConfig(),
      link: link(this.linkOptions),
    },
    marks: {
      inline_rdfa,
      em,
      strong,
      underline,
      strikethrough,
      subscript,
      superscript,
    },
  });

  plugins = [
    chromeHacksPlugin(),
    firefoxCursorFix(),
    lastKeyPressedPlugin,
    listTrackingPlugin(),
    tablePlugin,
    tableKeymap,
    inputRules({
      rules: [
        bullet_list_input_rule(this.schema.nodes.bullet_list),
        ordered_list_input_rule(this.schema.nodes.ordered_list),
      ],
    }),
  ];

  get linkOptions() {
    return {
      interactive: true,
    };
  }

  @action
  handleRdfaEditorInit(editorController) {
    this.editorController = editorController;
    this.setInitialValue();
  }

  @action
  updateValue(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    //rdfaEditor setup is async, updateValue may be called before it is set
    if (this.editorController) {
      this.hasBeenFocused = true;
      const htmlContent = this.editorController.htmlContent;
      const hasTextContent = Boolean(
        this.editorController.mainEditorState.doc.textContent
      );
      const editorValue = hasTextContent ? stripNbspEntities(htmlContent) : '';

      // Only trigger an update if the value actually changed.
      // This prevents that the form observer is triggered even though no editor content was changed.
      if (this.value !== editorValue) {
        this.updateValueInStore([editorValue]);
      }
    }
  }

  @action
  updateValueInStore(values) {
    this.value = values[0] || '';
    super.updateValue(this.value);
    this.setInitialValue();
  }

  loadProvidedValue() {
    super.loadProvidedValue();

    if (this.value == null) {
      // The editor returns an empty string if it contains no content, so we default to that to make the value comparison check works as expected.
      this.value = '';
    }
  }

  setInitialValue() {
    if (this.value !== undefined && this.value !== null) {
      // We replicate the behavior of the controller.setHtmlContent method without focussing the field.
      // Since we use the `focusout` event focusing the field would trigger the `updateValue` action,
      // which in turn causes the "unsaved changes" modal to appear when it shouldn't.
      // Source: https://github.com/lblod/ember-rdfa-editor/blob/4dc3fdf14ac3e92567db22811bb76b2079c2280b/addon/core/say-controller.ts#L42-L58
      const { editorController } = this;
      const tr = editorController.mainEditorState.tr;
      const domParser = new DOMParser();
      tr.replaceWith(
        0,
        tr.doc.nodeSize - 2,
        ProseParser.fromSchema(this.schema).parse(
          domParser.parseFromString(this.value, 'text/html'),
          {
            preserveWhitespace: true,
          }
        )
      );
      tr.setSelection(Selection.atEnd(tr.doc));
      editorController.editor.mainView.dispatch(tr);
    }
  }
}

// https://discuss.prosemirror.net/t/non-breaking-spaces-being-added-to-pasted-html/3911/4
// Kaleidos ran into the same issue:
// https://github.com/kanselarij-vlaanderen/frontend-kaleidos/blob/6489a2dec8d58f2cc981f0c45267821169061cc7/app/components/news-item/edit-panel.js#L84-L100
function stripNbspEntities(htmlContent) {
  return htmlContent.replaceAll(/&nbsp;/gm, ' ');
}
