// src/pages/PaymentSuccess.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingService } from '../../Services/api';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // read bookingId from query param
  const searchParams = new URLSearchParams(location.search);
  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    const confirm = async () => {
      if (!bookingId) {
        toast.error('Missing booking id');
        navigate('/dashboard'); // or wherever
        return;
      }

      try {
        // call backend to mark booking as CONFIRMED
        await bookingService.confirmBooking(bookingId);
        toast.success('Payment successful. Booking confirmed!');
        navigate('/bookings'); // or station details, etc.
      } catch (e) {
        toast.error('Payment succeeded but confirmation failed.');
      }
    };

    confirm();
  }, [bookingId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Finalizing your booking...</p>
    </div>
  );
  
}
