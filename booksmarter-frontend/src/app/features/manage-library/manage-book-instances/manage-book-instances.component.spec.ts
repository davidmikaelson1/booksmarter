import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBookInstancesComponent } from './manage-book-instances.component';

describe('ManageBookInstancesComponent', () => {
  let component: ManageBookInstancesComponent;
  let fixture: ComponentFixture<ManageBookInstancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBookInstancesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBookInstancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
