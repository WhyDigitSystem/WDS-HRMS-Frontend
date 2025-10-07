// utils/sessionUtils.js

export const handleSessionExpiration = () => {
  //   toast.error('Session Expired. Please login again.', {
  //     autoClose: 2000,
  //     theme: 'colored'
  //   });

  // Dispatch a custom event to trigger the popup
  const event = new CustomEvent('sessionExpired');
  window.dispatchEvent(event);
};
