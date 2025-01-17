export interface Account {
  id: string;
  name: string;
  email: string;
  image: string;
  default_profile_id: string;
}

export const ACCOUNT_KEY = 'account';
