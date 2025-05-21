import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBookInstanceDialogComponent } from './add-book-instance-dialog.component';

describe('AddBookInstanceDialogComponent', () => {
  let component: AddBookInstanceDialogComponent;
  let fixture: ComponentFixture<AddBookInstanceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBookInstanceDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBookInstanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
