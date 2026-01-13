import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { bookingService } from "../../Services/api";

export default function PaymentSuccess() {
 const location = useLocation();
const navigate = useNavigate();

const rawParams = new URLSearchParams(location.search);
const rawBookingId = rawParams.get("bookingId"); // "80?data=..."

const bookingId = rawBookingId ? rawBookingId.split("?")[0] : null; // "80"

const sessionId = rawParams.get("session_id"); // Stripe
const pidx = rawParams.get("pidx");            // Khalti
const esewaGatewayId = bookingId ? `BK-${bookingId}` : null;

const gatewayRef = sessionId || pidx || esewaGatewayId || null;

console.log("=== PAYMENT-SUCCESS ROUTE ===");
console.log("location.search =", location.search);
console.log("rawBookingId =", rawBookingId);
console.log("bookingId (clean) =", bookingId);
console.log("gatewayRef to send =", gatewayRef);
console.log("================================");
useEffect(() => {
  const confirm = async () => {
    if (!bookingId) {
      toast.error("Missing booking id");
      navigate("/ev-owner/station");
      return;
    }

    try {
      await bookingService.markPaymentSuccess(bookingId, gatewayRef);
      toast.success("Payment successful. Booking confirmed!");
      setTimeout(() => {
        navigate("/ev-owner/station");
      }, 2000);
    } catch (e) {
      toast.error("Payment succeeded but verification failed.");
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
