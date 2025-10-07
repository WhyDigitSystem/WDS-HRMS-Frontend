// ToastComponent.js
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastComponent = () => <ToastContainer />;

export const showToast = (type, message, options = {}) => {
  const config = {
    autoClose: 2000,
    theme: 'colored',
    ...options
  };

  switch (type) {
    case 'success':
      toast.success(message, config);
      break;
    case 'error':
      toast.error(message, config);
      break;
    case 'info':
      toast.info(message, config);
      break;
    case 'warning':
      toast.warn(message, config);
      break;
    default:
      toast(message, config);
      break;
  }
};

export default ToastComponent;
