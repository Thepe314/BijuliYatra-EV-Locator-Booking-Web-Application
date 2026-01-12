import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function KhaltiReturnPage() {
  const query = useQuery();
  const navigate = useNavigate();

  useEffect(() => {
    const status = query.get('status');          // Completed / Pending / User canceled
    const pidx = query.get('pidx');
    const purchaseOrderId = query.get('purchase_order_id');

    if (!pidx) {
      toast.error('Missing payment reference from Khalti');
      navigate('/ev-owner/dashboard');
      return;
    }

    if (status === 'Completed') {
      toast.success('Payment successful. Booking confirmed!');
      // optional: call your backend here to verify via lookup API using pidx
    } else if (status === 'User canceled') {
      toast.warn('Payment canceled.');
    } else if (status === 'Pending') {
      toast.info('Payment pending. Please wait or contact support.');
    } else {
      toast.error('Payment failed or unknown status.');
    }

    // redirect after a short delay so the toast is visible
    const timer = setTimeout(() => {
      navigate('/ev-owner/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [query, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg text-gray-700">
        Processing Khalti payment result…
      </p>
    </div>
  );
}