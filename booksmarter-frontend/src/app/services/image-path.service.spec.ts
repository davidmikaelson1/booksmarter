import { TestBed } from '@angular/core/testing';

import { ImagePathService } from './image-path.service';

describe('ImagePathService', () => {
  let service: ImagePathService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagePathService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
