import { combineReducers } from 'redux';

// reducer import
import customizationReducer from './customizationReducer';
import roleReducer from './roleReducer';

// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
  customization: customizationReducer,
  roleReducer
});

export default reducer;
