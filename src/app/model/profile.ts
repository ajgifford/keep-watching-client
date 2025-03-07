export interface Profile {
  id: string;
  name: string;
  image?: string;
}

export const PROFILE_KEY = 'profiles';
export const ACTIVE_PROFILE_KEY = 'activeProfile';
