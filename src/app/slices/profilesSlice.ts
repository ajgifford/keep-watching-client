import axiosInstance from '../api/axiosInstance';
import { PROFILE_KEY, Profile } from '../model/profile';
import { RootState } from '../store';
import { logout } from './accountSlice';
import { ActivityNotificationType, showActivityNotification } from './activityNotificationSlice';
import { EntityState, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

const saveToLocalStorage = (profiles: Profile[]) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
};

const loadFromLocalStorage = () => {
  const data = localStorage.getItem(PROFILE_KEY);
  const profiles = (data ? JSON.parse(data) : []) as Profile[];
  return profiles;
};

interface ProfileStatus extends EntityState<Profile, string> {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

interface ProfileSubStatus {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const profilesAdapter = createEntityAdapter<Profile>({
  sortComparer: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
});

const calculateInitialState = (): ProfileSubStatus => {
  const profiles = loadFromLocalStorage();
  if (profiles.length > 0) {
    return { status: 'succeeded', error: null };
  }
  return { status: 'idle', error: null };
};

const initialState: ProfileStatus = profilesAdapter.getInitialState(calculateInitialState(), loadFromLocalStorage());

type ErrorResponse = {
  message: string;
};

export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/accounts/${accountId}/profiles`);
      const profiles: Profile[] = response.data.results;
      return profiles;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  },
  {
    condition(arg, thunkApi) {
      const state = thunkApi.getState() as RootState;
      const profileStatus = selectProfilesStatus(state);
      const profiles = selectAllProfiles(state);
      if (profileStatus !== 'idle' || profiles.length > 0) {
        return false;
      }
    },
  }
);

export const addProfile = createAsyncThunk(
  'profiles/addProfile',
  async (
    { accountId, newProfileName }: { accountId: string; newProfileName: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(`/accounts/${accountId}/profiles`, { name: newProfileName });
      dispatch(
        showActivityNotification({
          message: `Added profile: ${newProfileName}`,
          type: ActivityNotificationType.Success,
        })
      );
      return response.data.result;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const deleteProfile = createAsyncThunk(
  'profiles/deleteProfile',
  async ({ accountId, profileId }: { accountId: string; profileId: string }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/accounts/${accountId}/profiles/${profileId}`);
      dispatch(
        showActivityNotification({
          message: `Profile deleted successfully`,
          type: ActivityNotificationType.Success,
        })
      );
      return profileId;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const editProfile = createAsyncThunk(
  'profiles/editProfile',
  async (
    { accountId, profileId, name }: { accountId: string; profileId: string; name: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(`/accounts/${accountId}/profiles/${profileId}`, { name });
      dispatch(
        showActivityNotification({
          message: `Profile edited successfully`,
          type: ActivityNotificationType.Success,
        })
      );
      return response.data.result;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const updateProfileImage = createAsyncThunk(
  'profiles/updateImage',
  async (
    { accountId, profileId, file }: { accountId: string; profileId: string; file: File },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData: FormData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.post(`/upload/accounts/${accountId}/profiles/${profileId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = response.data.result;

      dispatch(
        showActivityNotification({
          message: `Profile image updated successfully`,
          type: ActivityNotificationType.Success,
        })
      );
      return result;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showActivityNotification({
            message: errorResponse.message,
            type: ActivityNotificationType.Error,
          })
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showActivityNotification({
          message: 'An error occurred',
          type: ActivityNotificationType.Error,
        })
      );
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const profileSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        localStorage.removeItem(PROFILE_KEY);
        return profilesAdapter.getInitialState(calculateInitialState());
      })
      .addCase(addProfile.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(addProfile.fulfilled, (state, action) => {
        profilesAdapter.addOne(state, action.payload);
        saveToLocalStorage(Object.values(state.entities));
        state.status = 'succeeded';
      })
      .addCase(addProfile.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Add Profile Failed';
        } else {
          state.error = action.error.message || 'Add Profile Failed';
        }
      })
      .addCase(deleteProfile.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state, action) => {
        profilesAdapter.removeOne(state, action.payload);
        saveToLocalStorage(Object.values(state.entities));
        state.status = 'succeeded';
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Delete Profile Failed';
        } else {
          state.error = action.error.message || 'Delete Profile Failed';
        }
      })
      .addCase(editProfile.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(editProfile.fulfilled, (state, action) => {
        profilesAdapter.upsertOne(state, action.payload);
        saveToLocalStorage(Object.values(state.entities));
        state.status = 'succeeded';
      })
      .addCase(editProfile.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Edit Profile Failed';
        } else {
          state.error = action.error.message || 'Edit Profile Failed';
        }
      })
      .addCase(fetchProfiles.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        profilesAdapter.setAll(state, action.payload);
        saveToLocalStorage(action.payload);
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Get Profiles Failed';
        } else {
          state.error = action.error.message || 'Get Profiles Failed';
        }
      })
      .addCase(updateProfileImage.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        profilesAdapter.upsertOne(state, action.payload);
        saveToLocalStorage(Object.values(state.entities));
        state.status = 'succeeded';
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Profile Image Update Failed';
        } else {
          state.error = action.error.message || 'Profile Image Update Failed';
        }
      });
  },
});

export const {
  selectAll: selectAllProfiles,
  selectById: selectProfileById,
  selectIds: selectProfileIds,
} = profilesAdapter.getSelectors((state: RootState) => state.profiles);
export const selectProfilesStatus = (state: RootState) => state.profiles.status;
export const selectProfilesError = (state: RootState) => state.profiles.error;

export default profileSlice.reducer;
