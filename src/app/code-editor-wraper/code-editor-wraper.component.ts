import {
  Component,
  OnInit,
  Inject,
  Input,
  NgZone,
  InjectionToken,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { BaseEditor } from './base-editor';

declare var monaco: any;

export interface DiffEditorModel {
  code: string;
  language: string;
}
export interface NgxEditorModel {
  value: string;
  language?: string;
  uri?: any;
}

@Component({
  selector: 'app-code-editor-wraper',
  templateUrl: './code-editor-wraper.component.html',
  styleUrls: ['./code-editor-wraper.component.scss'],
})
export class CodeEditorWraperComponent extends BaseEditor {
  private _value: string = '';

  propagateChange = (_: any) => {};
  onTouched = () => {};

  @Input('options')
  set options(options: any) {
    this._options = Object.assign({}, this.config?.defaultOptions, options);
    if (this._editor) {
      this._editor.dispose();
      this.initMonaco(options);
    }
  }

  get options(): any {
    return this._options;
  }

  @Input('model')
  set model(model: NgxEditorModel) {
    this.options.model = model;
    if (this._editor) {
      this._editor.dispose();
      this.initMonaco(this.options);
    }
  }

  constructor(private zone: NgZone) {
    super();
  }

  writeValue(value: any): void {
    this._value = value || '';
    // Fix for value change while dispose in process.
    setTimeout(() => {
      if (this._editor && !this.options.model) {
        this._editor.setValue(this._value);
      }
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  protected initMonaco(options: any): void {

    const completionTriggerKeywords = [
      {
        label: 'Test1',
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: 'Test1',
        description: '1.1, 1.2, 1.3',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: 'Test2',
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: 'Test2',
        description: '2.1',
      },
      {
        label: 'Test3',
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: 'Test3',
        description: '3.1, 3.2, 3.3',
      },
      {
        label: 'Test4',
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: 'Test4',
        description: '4.1',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: 'Test5',
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: 'Test5',
        description: '5.1',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: 'Test6',
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: 'Test6',
        description: '6.1',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
    ];


    monaco.languages.registerCompletionItemProvider('java', {
      provideCompletionItems: (model:any, position:any) => {
        const wordBeforePosition = model.getWordUntilPosition({
          lineNumber: position.lineNumber,
          column: position.column - 1,
        });

        const wordUntilPosition = model.getWordUntilPosition(position);
        if (
          wordBeforePosition.word.trim() === '' ||
          wordUntilPosition.word.trim() === ''
        ) {
          const keywords = completionTriggerKeywords;

          const suggestions = keywords.map((id) => ({
            label: id.label,
            kind: id.kind,
            description: id.description,
            documentation: id.description,
            insertText: id.insertText,
            detail: id.description,
            insertTextRules: id.insertTextRules,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: wordUntilPosition.startColumn,
              endLineNumber: position.lineNumber,
              endColumn: wordUntilPosition.endColumn - 1,
            },
          }));
          return { suggestions };
        }else{
          return ['no']
        }
      },
    });

  


    const hasModel = !!options?.model;

    if (hasModel) {
      const model = monaco.editor.getModel(options.model.uri || '');
      if (model) {
        options.model = model;
        options.model.setValue(this._value);
      } else {
        options.model = monaco.editor.createModel(
          options.model.value,
          options.model.language,
          options.model.uri
        );
      }
    }
    const opt = {
      value: 'console.log("abc");',
      theme: 'vs-dark', // dark theme
      language: 'java',
    };

    this._editor = monaco.editor.create(
      this._editorContainer?.nativeElement,
      opt
    );

    if (!hasModel) {
      this._editor.setValue(this._value || opt.value);
      //this._editor.setValue('console.log("abc");');
    }

    this._editor.onDidChangeModelContent((e: any) => {
      const value = this._editor.getValue();

      // value is not propagated to parent when executing outside zone.
      this.zone.run(() => {
        this.propagateChange(value);
        this._value = value;
      });
    });

    this._editor.onDidBlurEditorWidget(() => {
      this.onTouched();
    });

    // refresh layout on resize event.
    if (this._windowResizeSubscription) {
      this._windowResizeSubscription.unsubscribe();
    }
    this._windowResizeSubscription = fromEvent(window, 'resize').subscribe(() =>
      this._editor.layout()
    );
    this.onInit.emit(this._editor);
  }
}
