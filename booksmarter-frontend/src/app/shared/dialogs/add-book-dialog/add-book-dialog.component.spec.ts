import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBookDialogComponent } from './add-book-dialog.component';

describe('AddBookDialogComponent', () => {
  let component: AddBookDialogComponent;
  let fixture: ComponentFixture<AddBookDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBookDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBookDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
