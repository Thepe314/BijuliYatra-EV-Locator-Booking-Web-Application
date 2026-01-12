import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Zap,
  Clock,
  Calendar,
  ArrowLeft,
  BatteryCharging,
  AlertCircle,
  Loader,
  CreditCard,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { stationService, bookingService } from '../../Services/api';

export default function BookingPage() {
  const { stationId } = useParams();
console.log('booking stationId', stationId);
  const navigate = useNavigate();

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    duration: '2',
    connectorType: 'DC Fast',
    paymentMethod: 'KHALTI', // CARD | ESEWA | KHALTI
  });

  const [showCardPopup, setShowCardPopup] = useState(false);
  const [cardPaymentUrl, setCardPaymentUrl] = useState('');

  const timeSlots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
  ];

  // 1) Load single station from /evowner/{id}
  useEffect(() => {
  const loadStation = async () => {
    if (!stationId) {
      navigate('/ev-owner/station');
      return;
    }

    try {
      setLoading(true);
      // uses /evowner/{id} under the hood; no manual fetch
      const data = await stationService.getStationByIdE(stationId);
      setStation(data);
      toast.success(`Welcome to ${data.name}`, {
        icon: <Zap className="w-5 h-5" />,
        toastId: `welcome-station-${data.id}`,
      });
    } catch (err) {
      // if backend returns 404/403/etc. you land here
      toast.error('Failed to load station');
      navigate('/ev-owner/station'); // go back to list
    } finally {
      setLoading(false);
    }
  };

  loadStation();
}, [stationId, navigate]);

  // 2) Fetch bookings for a day to build blocked slots
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!station || !formData.date) {
        setBookedSlots([]);
        return;
      }

      try {
        const res = await fetch(
          `/bookings/stations/${stationId}/bookings?date=${formData.date}`,
          {
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
          }
        );

        if (!res.ok) throw new Error('Failed to fetch availability');

        const bookings = await res.json();
        const blocked = new Set();

        bookings.forEach((booking) => {
          const start = new Date(booking.startTime);
          const end = new Date(booking.endTime);
          const bufferEnd = new Date(end.getTime() + 15 * 60 * 1000);

          let current = new Date(start);
          current.setMinutes(0, 0, 0);

          while (current < bufferEnd) {
            const key = current.toISOString().slice(0, 16);
            blocked.add(key);
            current.setHours(current.getHours() + 1);
          }
        });

        setBookedSlots(Array.from(blocked));
      } catch (err) {
        console.log('Availability check failed, will rely on backend validation');
        setBookedSlots([]);
      }
    };

    fetchAvailability();
  }, [station, formData.date, stationId]);

  // 3) Submit booking + payment init
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.timeSlot) {
      toast.warn('Please select date and time');
      return;
    }

    setSubmitting(true);

    const [hours, minutes] = formData.timeSlot.split(':');
    const startTime = new Date(formData.date);
    startTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + parseInt(formData.duration, 10));

    const formatDateTime = (date) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    };

    const payload = {
      stationId: parseInt(stationId, 10),
      startTime: formatDateTime(startTime),
      endTime: formatDateTime(endTime),
      connectorType: formData.connectorType,
      paymentMethod: formData.paymentMethod,
    };

    try {
  const result = await bookingService.createBooking(payload);
  if (!result?.paymentUrl) {
    toast.error('Unable to start payment. Please try again.');
    return;
  }

    // 1) eSewa path (NEW)
    if (formData.paymentMethod === 'ESEWA') {
      const bookingId = result.id || result.bookingId;
      if (!bookingId) {
        toast.error('Missing booking ID for eSewa payment');
        return;
      }

      try {
        const initRes = await fetch('http://localhost:4000/payments/esewa/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, amount: totalCost }),
        });

        if (!initRes.ok) {
          toast.error('Failed to initialize eSewa payment');
          return;
        }

        const { esewa, formUrl } = await initRes.json();
        if (!esewa || !formUrl) {
          toast.error('Invalid eSewa init response');
          return;
        }

        toast.info('Redirecting to eSewa…', { autoClose: 1200 });

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = formUrl;

        Object.entries(esewa).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      } catch (e) {
        console.error('eSewa init failed', e);
        toast.error('Failed to initialize eSewa payment');
        return;
      }
    }

    // 2) Khalti + Card logic
    if (formData.paymentMethod === 'KHALTI') {
      const bookingId = result.id || result.bookingId;
      if (!bookingId) {
        toast.error('Missing booking ID for Khalti payment');
        return;
      }

      try {
        const initRes = await fetch(
          'http://localhost:4000/payments/khalti/init',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, amount: totalCost }),
          }
        );

        if (!initRes.ok) {
          toast.error('Failed to initialize Khalti payment');
          return;
        }

        const { paymentUrl } = await initRes.json();
        if (!paymentUrl) {
          toast.error('Invalid Khalti init response');
          return;
        }

        toast.info('Redirecting to Khalti…', { autoClose: 1500 });
        setTimeout(() => {
          window.location.href = paymentUrl; // test-pay.khalti.com/?pidx=...
        }, 1200);
      } catch (e) {
        console.error('Khalti init failed', e);
        toast.error('Failed to initialize Khalti payment');
      }
    } else if (formData.paymentMethod === 'CARD') {
      setCardPaymentUrl(result.paymentUrl);
      setShowCardPopup(true);
    } else if (formData.paymentMethod === 'ESEWA') {
      toast.error('eSewa temporarily disabled for testing');
    } else {
      toast.error('Unknown payment method');
    }
  } catch (err) {
    const msg =
      err.response?.data ||
      'Slot no longer available or payment could not be initialized.';
    toast.error(msg);
  } finally {
    setSubmitting(false);
  }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading station…</p>
        </div>
      </div>
    );
  }

  if (!station) return null;

  const rate =
    formData.connectorType === 'DC Fast'
      ? station.dcFastRate || 60
      : station.level2Rate || 40;
  const hours = parseInt(formData.duration, 10);

let estimatedKwh;
if (formData.connectorType === 'DC Fast') {
  estimatedKwh = hours * 25;
} else {
  estimatedKwh = hours * 15;
}

const totalCost = Math.round(rate * estimatedKwh);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {station.name}
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {station.address}
            {station.city && `, ${station.city}`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form column */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-xl p-8 space-y-8"
            >
              {/* Charger type */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Zap className="w-7 h-7 text-emerald-600" /> Charger Type
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {station.dcFastChargers > 0 && (
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="connectorType"
                        value="DC Fast"
                        checked={formData.connectorType === 'DC Fast'}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            connectorType: e.target.value,
                          }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`p-6 border-2 rounded-xl transition-all ${
                          formData.connectorType === 'DC Fast'
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <p className="font-bold text-lg">DC Fast Charger</p>
                        <p className="text-sm text-gray-600">
                          Up to 150 kW • {station.dcFastChargers} ports
                        </p>
                        <p className="text-2xl font-bold text-emerald-600 mt-2">
                          Rs. {station.dcFastRate || 60}/kWh
                        </p>
                      </div>
                    </label>
                  )}

                  {station.level2Chargers > 0 && (
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="connectorType"
                        value="Level 2"
                        checked={formData.connectorType === 'Level 2'}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            connectorType: e.target.value,
                          }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`p-6 border-2 rounded-xl transition-all ${
                          formData.connectorType === 'Level 2'
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <p className="font-bold text-lg">Level 2 (AC)</p>
                        <p className="text-sm text-gray-600">
                          22 kW • {station.level2Chargers} ports
                        </p>
                        <p className="text-2xl font-bold text-emerald-600 mt-2">
                          Rs. {station.level2Rate || 40}/kWh
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Date + duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold mb-3">
                    <Calendar className="w-5 h-5 inline mr-2" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date: e.target.value,
                        timeSlot: '',
                      }))
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-3">
                    Duration
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                  >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                    <option value="4">4 hours</option>
                  </select>
                </div>
              </div>

              {/* Time slots */}
              <div>
                <label className="block text-lg font-semibold mb-4">
                  <Clock className="w-5 h-5 inline mr-2" /> Available Time Slots
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map((slot) => {
                    const slotDateTime = formData.date
                      ? `${formData.date}T${slot}:00`
                      : null;
                    const slotKey = slotDateTime?.slice(0, 16);
                    const isBlocked = slotKey && bookedSlots.includes(slotKey);

                    let durationBlocked = false;
                    if (formData.date && slotDateTime) {
                      const start = new Date(slotDateTime);
                      const end = new Date(
                        start.getTime() +
                          parseInt(formData.duration, 10) * 3600000
                      );
                      let check = new Date(start);
                      while (check < end) {
                        const checkKey = check
                          .toISOString()
                          .slice(0, 16);
                        if (bookedSlots.includes(checkKey)) {
                          durationBlocked = true;
                          break;
                        }
                        check.setHours(check.getHours() + 1);
                      }
                    }

                    const disabled =
                      !formData.date || isBlocked || durationBlocked;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) {
                            toast.warn(
                              isBlocked
                                ? 'This hour is booked or in buffer zone'
                                : `Need ${formData.duration}h continuous free time`
                            );
                            return;
                          }
                          setFormData((prev) => ({
                            ...prev,
                            timeSlot: slot,
                          }));
                        }}
                        className={`py-4 rounded-xl font-medium text-lg transition-all relative
                          ${
                            formData.timeSlot === slot && !disabled
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
                              : disabled
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed line-through'
                              : 'bg-gray-100 hover:bg-emerald-100 hover:shadow-md text-gray-800'
                          }`}
                      >
                        {slot}
                        {disabled && (
                          <div className="absolute inset-0 rounded-xl bg-black opacity-10" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-6 mt-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-emerald-600" />
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-gray-200 line-through" />
                    <span>Booked / Buffer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-gray-100" />
                    <span>Available</span>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-emerald-600" /> Payment
                  Method
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'CARD',
                      label: 'Debit / Credit Card',
                      desc: 'Pay with bank card',
                      badge: 'Powered by PSP',
                    },
                    {
                      id: 'ESEWA',
                      label: 'eSewa',
                      desc: 'Wallet payment',
                      badge: 'Popular in Nepal',
                    },
                    {
                      id: 'KHALTI',
                      label: 'Khalti',
                      desc: 'Wallet, banking & cards',
                      badge: 'Recommended',
                    },
                  ].map((m) => (
                    <label key={m.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={m.id}
                        checked={formData.paymentMethod === m.id}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            paymentMethod: e.target.value,
                          }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`p-4 border-2 rounded-xl transition-all ${
                          formData.paymentMethod === m.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <p className="font-semibold">{m.label}</p>
                        <p className="text-xs text-gray-600">{m.desc}</p>
                        <p className="text-[11px] text-emerald-700 mt-1">
                          {m.badge}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cancellation notice */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                <div className="flex gap-4">
                  <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-amber-900">
                      Free cancellation up to 30 minutes before
                    </p>
                    <p className="text-sm text-amber-800">
                      After that, 50% charge applies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !formData.date || !formData.timeSlot}
                className="w-full py-6 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold text-xl rounded-2xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>Processing…</>
                ) : (
                  <>
                    <BatteryCharging className="w-7 h-7" />
                    Pay &amp; Confirm • Rs. {totalCost.toLocaleString()}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Summary column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Booking Summary
              </h3>
              <div className="space-y-5 text-lg">
                <div className="flex items-start gap-4 pb-5 border-b">
                  <MapPin className="w-6 h-6 text-emerald-600 mt-1" />
                  <div>
                    <p className="font-bold">{station.name}</p>
                    <p className="text-gray-600 text-sm">
                      {station.address}
                      {station.city && `, ${station.city}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Charger</span>
                    <span className="font-bold">
                      {formData.connectorType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate</span>
                    <span className="font-bold text-emerald-600">
                      Rs. {rate}/kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Energy</span>
                    <span className="font-bold">
                      ~{estimatedKwh} kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-bold">
                      {formData.duration} hour
                      {parseInt(formData.duration, 10) > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-bold">
                      {formData.paymentMethod === 'CARD'
                        ? 'Card / Bank'
                        : formData.paymentMethod === 'ESEWA'
                        ? 'eSewa'
                        : 'Khalti'}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-6 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total Amount</span>
                    <span className="text-3xl font-bold text-emerald-600">
                      Rs. {totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  

      {/* Card popup */}
      {showCardPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              type="button"
              className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setShowCardPopup(false)}
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4">Pay with Card / Bank</h2>
            <p className="text-sm text-gray-600 mb-4">
              A secure payment window will open for your card details.
            </p>

            <button
              type="button"
              onClick={() => {
                if (!cardPaymentUrl) {
                  toast.error('Payment URL missing');
                  return;
                }
                window.open(
                  cardPaymentUrl,
                  '_blank',
                  'width=600,height=700'
                );
              }}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Open Secure Card Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}