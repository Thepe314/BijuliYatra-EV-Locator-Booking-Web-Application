import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { bookingService } from "../../Services/api";

export default function PaymentFailed() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const bookingId = searchParams.get("bookingId"); // from ?bookingId=
  const sessionId = searchParams.get("session_id"); // Stripe (if provided)
  const pidx = searchParams.get("pidx");            // Khalti
  const esewaData = searchParams.get("data");       // eSewa

  const gatewayRef = sessionId || pidx || esewaData || null;

 useEffect(() => {
  const handleFailure = async () => {
    console.log("PaymentFailed query params:", {
      bookingId,
      sessionId,
      pidx,
      esewaData: esewaData?.slice(0, 50)
    });

    if (!bookingId) {
      console.error("PaymentFailed: missing bookingId in URL");
      toast.error("Missing booking id");
      navigate("/ev-owner/station");
      return;
    }

    try {
      console.log("Marking payment as FAILED for booking:", bookingId, "ref:", gatewayRef);
      await bookingService.markPaymentFailed(bookingId, gatewayRef);
      console.log("markPaymentFailed success");
    } catch (e) {
      console.error("markPaymentFailed API error:", e);
    } finally {
      toast.error("Payment failed. Your booking was not completed.");
      setTimeout(() => navigate("/ev-owner/station"), 2000);
    }
  };

  handleFailure();
}, [bookingId, gatewayRef, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Payment failed. Returning to stations...</p>
    </div>
  );
}
