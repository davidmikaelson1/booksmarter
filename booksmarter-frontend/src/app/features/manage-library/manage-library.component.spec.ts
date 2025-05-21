import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLibraryComponent } from './manage-library.component';

describe('ManageLibraryComponent', () => {
  let component: ManageLibraryComponent;
  let fixture: ComponentFixture<ManageLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageLibraryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
