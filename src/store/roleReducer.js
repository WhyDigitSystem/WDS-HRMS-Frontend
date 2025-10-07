// In your Redux reducer file (e.g., reducer.js)
import { SET_USER_ROLE } from './actionTypes';

const initialState = {
  role: null
};

const roleReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_ROLE:
      return {
        ...state,
        role: action.payload
      };
    default:
      return state;
  }
};

export default roleReducer;
