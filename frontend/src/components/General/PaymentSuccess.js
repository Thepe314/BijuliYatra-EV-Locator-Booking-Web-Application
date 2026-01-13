import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookingService } from '../../Services/api';

export default function PaymentSuccess() {
  const { bookingId } = useParams();      // /payment-success/:bookingId
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);

  // Stripe
  const sessionId = searchParams.get('session_id');
  // Khalti
  const pidx = searchParams.get('pidx');
  // eSewa
  const esewaData = searchParams.get('data');

  const gatewayRef = sessionId || pidx || esewaData || null;

  useEffect(() => {
    const confirm = async () => {
      if (!bookingId) {
        toast.error('Missing booking id');
        navigate('/ev-owner/station');
        return;
      }

      try {
        await bookingService.markPaymentSuccess(bookingId, gatewayRef);
        toast.success('Payment successful. Booking confirmed!');
        setTimeout(() => {
          navigate('/ev-owner/station');
        }, 2000);
      } catch (e) {
        toast.error('Payment succeeded but verification failed.');
      }
    };

    confirm();
  }, [bookingId, gatewayRef, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Finalizing your booking...</p>
    </div>
  );
}
