import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImagePathService {

  getCoverImagePath(coverUrl: string | undefined): string {
    if (!coverUrl) {
      return '/assets/placeholder.png?v=1';
    }

    // Check if this is already a full path starting with / or http
    if (coverUrl.startsWith('/') || coverUrl.startsWith('http')) {
      return coverUrl;
    }

    // Otherwise, assume it's just a filename and add the assets prefix
    return `/assets/${coverUrl}`;
  }
}
