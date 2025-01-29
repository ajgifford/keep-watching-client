import axiosInstance from '../api/axiosInstance';
import { auth } from '../firebaseConfig';
import { ACCOUNT_KEY, Account } from '../model/account';
import { RootState } from '../store';
import { setActiveProfile } from './activeProfileSlice';
import { NotificationType, showNotification } from './notificationSlice';
import { fetchProfiles } from './profilesSlice';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';

type LoginData = {
  email: string;
  password: string;
};

type NewAccountData = LoginData & {
  name: string;
};

type AccountState = {
  account?: Account | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
};

const initialState: AccountState = {
  account: localStorage.getItem(ACCOUNT_KEY) ? JSON.parse(localStorage.getItem(ACCOUNT_KEY) as string) : null,
  status: 'idle',
  error: null,
};

type ErrorResponse = {
  message: string;
};

export const login = createAsyncThunk('account/login', async (data: LoginData, { dispatch, rejectWithValue }) => {
  let userCredential = null;
  try {
    userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
  } catch (error) {
    const errorMessage = getFirebaseAuthErrorMessage(
      error as FirebaseError,
      'An unknown error occurred during login. Please try again.',
    );
    dispatch(
      showNotification({
        message: errorMessage,
        type: NotificationType.Error,
      }),
    );
    return rejectWithValue({ message: errorMessage });
  }

  try {
    const response = await axiosInstance.post('/login', { uid: userCredential.user.uid });
    const loginResult: Account = response.data.result;

    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(loginResult));
    dispatch(
      showNotification({
        message: response.data.message || 'Success',
        type: NotificationType.Success,
      }),
    );
    await dispatch(fetchProfiles(loginResult.id));
    await dispatch(setActiveProfile({ accountId: loginResult.id, profileId: loginResult.default_profile_id }));

    return loginResult;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorResponse = error.response.data;
      dispatch(
        showNotification({
          message: errorResponse.message,
          type: NotificationType.Error,
        }),
      );
      return rejectWithValue(errorResponse);
    }
    dispatch(
      showNotification({
        message: 'An error occurred',
        type: NotificationType.Error,
      }),
    );

    console.error(error);
    return rejectWithValue({ message: 'Login: Unexpected Error' });
  }
});

export const register = createAsyncThunk(
  'acocunt/register',
  async (data: NewAccountData, { dispatch, rejectWithValue }) => {
    let userCredential = null;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.name });
    } catch (error) {
      const errorMessage = getFirebaseAuthErrorMessage(
        error as FirebaseError,
        'An unknown error occurred during registration. Please try again.',
      );
      dispatch(
        showNotification({
          message: errorMessage,
          type: NotificationType.Error,
        }),
      );
      return rejectWithValue({ message: errorMessage });
    }
    try {
      const response = await axiosInstance.post('/accounts/', {
        email: data.email,
        uid: userCredential.user.uid,
        name: data.name,
      });
      const resgisterResult: Account = response.data.result;

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(resgisterResult));
      dispatch(
        showNotification({
          message: response.data.message || 'Success',
          type: NotificationType.Success,
        }),
      );
      await dispatch(fetchProfiles(resgisterResult.id));
      await dispatch(
        setActiveProfile({ accountId: resgisterResult.id, profileId: resgisterResult.default_profile_id }),
      );

      return resgisterResult;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showNotification({
            message: errorResponse.message,
            type: NotificationType.Error,
          }),
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showNotification({
          message: 'An error occurred',
          type: NotificationType.Error,
        }),
      );

      console.error(error);
      return rejectWithValue({ message: 'Register: Unexpected Error' });
    }
  },
);

export const logout = createAsyncThunk('account/logout', async (_, { dispatch, rejectWithValue }) => {
  try {
    await signOut(auth);

    localStorage.removeItem(ACCOUNT_KEY);
    dispatch(
      showNotification({
        message: 'Successfully logged out',
        type: NotificationType.Success,
      }),
    );

    return;
  } catch (error) {
    const errorMessage = getFirebaseAuthErrorMessage(
      error as FirebaseError,
      'An unknown error occurred during logout. Please try again.',
    );
    dispatch(
      showNotification({
        message: errorMessage,
        type: NotificationType.Error,
      }),
    );
    return rejectWithValue({ message: errorMessage });
  }
});

export const updateAccountImage = createAsyncThunk(
  'account/updateImage',
  async ({ accountId, file }: { accountId: string; file: File }, { dispatch, rejectWithValue }) => {
    try {
      const formData: FormData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.post(`/upload/accounts/${accountId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = response.data.result;

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(result));
      dispatch(
        showNotification({
          message: `Account image updated successfully`,
          type: NotificationType.Success,
        }),
      );
      return result;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showNotification({
            message: errorResponse.message,
            type: NotificationType.Error,
          }),
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showNotification({
          message: 'An error occurred',
          type: NotificationType.Error,
        }),
      );
      console.error(error);
      return rejectWithValue({ message: 'UpdateImage: Unexpected Error' });
    }
  },
);

export const updateAccount = createAsyncThunk(
  'account/update',
  async (
    {
      account_id,
      account_name,
      default_profile_id,
    }: { account_id: string; account_name: string; default_profile_id: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.put(`/accounts/${account_id}/`, { account_name, default_profile_id });
      const updateResult = response.data.result;
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(updateResult));
      dispatch(
        showNotification({
          message: `Account edited successfully`,
          type: NotificationType.Success,
        }),
      );
      return updateResult;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorResponse = error.response.data;
        dispatch(
          showNotification({
            message: errorResponse.message,
            type: NotificationType.Error,
          }),
        );
        return rejectWithValue(errorResponse);
      }
      dispatch(
        showNotification({
          message: 'An error occurred',
          type: NotificationType.Error,
        }),
      );
      console.error(error);
      return rejectWithValue({ message: 'UpdateAccount: Unexpected Error' });
    }
  },
);

function getFirebaseAuthErrorMessage(error: FirebaseError, defaultMessage: string) {
  switch (error.code) {
    case 'auth/invalid-credential':
      return 'Invalid credentials were entered. Check your email & password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up.';
    case 'auth/wrong-password':
      return 'The password you entered is incorrect.';
    case 'auth/user-disabled':
      return 'Your account has been disabled. Contact support.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/operation-not-allowed':
      return 'Sign-in is currently disabled. Contact support.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists, sign in or use another email.';
    default:
      console.error('An unknown error occurred:', error.message);
      return defaultMessage;
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<Account>) => {
        state.status = 'idle';
        state.account = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Login Failed';
        } else {
          state.error = action.error.message || 'Login Failed';
        }
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<Account>) => {
        state.status = 'idle';
        state.account = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Registration Failed';
        } else {
          state.error = action.error.message || 'Registration Failed';
        }
      })
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle';
        state.account = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Logout Failed';
        } else {
          state.error = action.error.message || 'Logout Failed';
        }
      })
      .addCase(updateAccountImage.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAccountImage.fulfilled, (state, action: PayloadAction<Account>) => {
        state.status = 'idle';
        state.account = action.payload;
      })
      .addCase(updateAccountImage.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Account Image Update Failed';
        } else {
          state.error = action.error.message || 'Account Image Update Failed';
        }
      })
      .addCase(updateAccount.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        state.status = 'idle';
        state.account = action.payload;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = (action.payload as ErrorResponse).message || 'Account Update Failed';
        } else {
          state.error = action.error.message || 'Account Update Failed';
        }
      });
  },
});

export const selectCurrentAccount = (state: RootState) => state.auth.account;

export default authSlice.reducer;
