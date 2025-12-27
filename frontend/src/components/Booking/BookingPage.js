import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Zap, Clock, Calendar, ArrowLeft, 
  BatteryCharging, AlertCircle, Loader,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-toastify';
import { stationService, bookingService } from '../../Services/api';

export default function BookingPage() {
  const { stationId } = useParams();
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

  // NEW: card popup state
  const [showCardPopup, setShowCardPopup] = useState(false);
  const [cardPaymentUrl, setCardPaymentUrl] = useState('');

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // Load station securely (only owner's stations)
  useEffect(() => {
    const loadStation = async () => {
      if (!stationId) {
        navigate('/stations');
        return;
      }

      try {
        setLoading(true);
        const response = await stationService.listStationsForOwner();
        const stations = response?.data || response || [];
        const foundStation = stations.find(s => s.id === parseInt(stationId));

        if (!foundStation) {
          toast.error("Station not found or access denied");
          navigate('/stations');
          return;
        }

       setStation(foundStation);
      toast.success(`Welcome to ${foundStation.name}`, {
        icon: <Zap className="w-5 h-5" />,
        toastId: `welcome-station-${foundStation.id}`,
      });
      } catch (err) {
        toast.error("Failed to load station");
        navigate('/stations');
      } finally {
        setLoading(false);
      }
    };

    loadStation();
  }, [stationId, navigate]);

  // Fetch bookings + apply 15-min buffer
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!station || !formData.date) {
        setBookedSlots([]);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/stations/${stationId}/bookings?date=${formData.date}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch');

        const bookings = await response.json();
        const blocked = new Set();

        bookings.forEach((booking) => {
          const start = new Date(booking.startTime);
          const end = new Date(booking.endTime);
          const bufferEnd = new Date(end.getTime() + 15 * 60 * 1000);

          let current = new Date(start);
          current.setMinutes(0, 0, 0);

          while (current < bufferEnd) {
            const isoKey = current.toISOString().slice(0, 16);
            blocked.add(isoKey);
            current.setHours(current.getHours() + 1);
          }
        });

        setBookedSlots(Array.from(blocked));
      } catch (err) {
        console.log('Availability check failed (will block on submit)');
        setBookedSlots([]);
      }
    };

    fetchAvailability();
  }, [station, formData.date, stationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.timeSlot) {
      toast.warn('Please select date and time');
      return;
    }

    setSubmitting(true);

    const [hours, minutes] = formData.timeSlot.split(':');
    const startTime = new Date(formData.date);
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + parseInt(formData.duration));

    const formatDateTime = (date) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    };

    const payload = {
      stationId: parseInt(stationId),
      startTime: formatDateTime(startTime),
      endTime: formatDateTime(endTime),
      connectorType: formData.connectorType,
      paymentMethod: formData.paymentMethod,
    };

    try {
      const result = await bookingService.createBooking(payload);
      console.log('createBooking result:', result);

      if (!result?.paymentUrl) {
        toast.error('Unable to start payment. Please try again.', {
          position: 'top-center',
        });
        return;
      }

      if (formData.paymentMethod === 'KHALTI' || formData.paymentMethod === 'ESEWA') {
        // Redirect to Khalti / eSewa page
        toast.info('Redirecting to payment...', {
          position: 'top-center',
          autoClose: 1500,
        });
        setTimeout(() => {
          window.location.href = result.paymentUrl;
        }, 1200);
      } else if (formData.paymentMethod === 'CARD') {
        // Show card popup
        setCardPaymentUrl(result.paymentUrl); // hosted card page or client token URL
        setShowCardPopup(true);
      } else {
        toast.error('Unknown payment method', { position: 'top-center' });
      }
    } catch (err) {
      const msg =
        err.response?.data ||
        'Slot no longer available or payment could not be initialized.';
      toast.error(msg, { position: 'top-center' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading station...</p>
        </div>
      </div>
    );
  }

  if (!station) return null;

  const rate =
    formData.connectorType === 'DC Fast'
      ? station.dcFastRate || 60
      : station.level2Rate || 40;
  const estimatedKwh = parseInt(formData.duration) * 50;
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
            Book Charging Slot
          </h1>
          <p className="text-gray-600 mt-1">{station.name}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-xl p-8 space-y-8"
            >
              {/* Charger Type */}
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
                          setFormData({
                            ...formData,
                            connectorType: e.target.value,
                          })
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
                          setFormData({
                            ...formData,
                            connectorType: e.target.value,
                          })
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

              {/* Date & Duration */}
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
                      setFormData({
                        ...formData,
                        date: e.target.value,
                        timeSlot: '',
                      })
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
                      setFormData({ ...formData, duration: e.target.value })
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

              {/* Time Slots */}
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
                    const isBlocked =
                      slotKey && bookedSlots.includes(slotKey);

                    let durationBlocked = false;
                    if (formData.date && slotDateTime) {
                      const start = new Date(slotDateTime);
                      const end = new Date(
                        start.getTime() +
                          parseInt(formData.duration) * 3600000
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
                          setFormData({ ...formData, timeSlot: slot });
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
                          <div className="absolute inset-0 rounded-xl bg-black opacity-10"></div>
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

              {/* Payment Method */}
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
                          setFormData({
                            ...formData,
                            paymentMethod: e.target.value,
                          })
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

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                <div className="flex gap-4">
                  <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-amber-900">
                      Free cancellation up to 30 minutes before
                    </p>
                    <p className="text-sm text-amber-800">
                      After that, 50% charge applies
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !formData.date || !formData.timeSlot}
                className="w-full py-6 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold text-xl rounded-2xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <BatteryCharging className="w-7 h-7" />
                    Pay & Confirm • Rs. {totalCost.toLocaleString()}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Summary */}
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
                      {station.address}, {station.city}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Charger</span>
                    <span className="font-bold">{formData.connectorType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate</span>
                    <span className="font-bold text-emerald-600">
                      Rs. {rate}/kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Energy</span>
                    <span className="font-bold">~{estimatedKwh} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-bold">
                      {formData.duration} hour
                      {parseInt(formData.duration) > 1 ? 's' : ''}
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

      {/* CARD POPUP */}
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
              Complete your payment securely. A new secure window will open for card details.
            </p>

            <button
              type="button"
              onClick={() => {
                if (!cardPaymentUrl) {
                  toast.error('Payment URL missing');
                  return;
                }
                window.open(cardPaymentUrl, '_blank', 'width=600,height=700');
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
