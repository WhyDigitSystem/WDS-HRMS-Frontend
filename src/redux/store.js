// store.js
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

// Example of a slice reducer
import userReducer from './features/user/userSlice';

const rootReducer = combineReducers({
  user: userReducer
  // Add other reducers here
});

const store = configureStore({
  reducer: rootReducer
});

export default store;
