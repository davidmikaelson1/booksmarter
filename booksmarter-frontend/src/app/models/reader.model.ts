import { LibraryUser } from './library-user.model';

export interface Reader extends LibraryUser {
  pnc: string;
  address: string;
  phoneNumber: string;
}
