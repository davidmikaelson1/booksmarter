import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBookInstanceDialogComponent } from './edit-book-instance-dialog.component';

describe('EditBookInstanceDialogComponent', () => {
  let component: EditBookInstanceDialogComponent;
  let fixture: ComponentFixture<EditBookInstanceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBookInstanceDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBookInstanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
