// Utils/notify.js
import { toast } from "react-toastify";

const baseOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
};

export const notify = {
  success(message, options = {}) {
    toast.success(message, { ...baseOptions, ...options });
  },
  error(message, options = {}) {
    toast.error(message, { ...baseOptions, ...options });
  },
  info(message, options = {}) {
    toast.info(message, { ...baseOptions, ...options });
  },
  warning(message, options = {}) {
    toast.warning(message, { ...baseOptions, ...options });
  },
};

export default notify; 
