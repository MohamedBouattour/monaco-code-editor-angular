import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeEditorWraperComponent } from './code-editor-wraper.component';

describe('CodeEditorWraperComponent', () => {
  let component: CodeEditorWraperComponent;
  let fixture: ComponentFixture<CodeEditorWraperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeEditorWraperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeEditorWraperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
