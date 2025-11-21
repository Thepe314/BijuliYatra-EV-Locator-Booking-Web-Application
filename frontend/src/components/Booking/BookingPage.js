// src/pages/BookingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Zap, Clock, Calendar, Check, ArrowLeft, 
  BatteryCharging, AlertCircle, Loader 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { stationService } from '../../Services/api';
import { bookingService } from '../../Services/api'; // Make sure this is imported

export default function BookingPage() {
  const { stationId } = useParams(); // Get from URL: /book/station/1
  const navigate = useNavigate();

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    duration: '2', // hours
    connectorType: 'DC Fast', // default
  });

  // Fetch station details
  useEffect(() => {
    const loadStation = async () => {
      try {
        const response = await stationService.getStationById(stationId);
        setStation(response.data || response);
      } catch (err) {
        toast.error("Failed to load station details");
        navigate('/stations');
      } finally {
        setLoading(false);
      }
    };

    if (stationId) loadStation();
  }, [stationId, navigate]);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.timeSlot) {
      toast.error("Please select date and time");
      return;
    }

    setSubmitting(true);

    const [hours, minutes] = formData.timeSlot.split(':');
    const startTime = new Date(formData.date);
    startTime.setHours(parseInt(hours), parseInt(minutes));

    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + parseInt(formData.duration));

    const bookingPayload = {
      stationId: parseInt(stationId),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      connectorType: formData.connectorType,
    };

    try {
      const result = await bookingService.createBooking(bookingPayload);
      toast.success("Booking confirmed! Check your email.");
      navigate(`/bookings/${result.data.id}`); // or to success page
    } catch (err) {
      const msg = err.response?.data || "Slot no longer available";
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
          <p className="text-lg text-gray-600">Loading station details...</p>
        </div>
      </div>
    );
  }

  if (!station) {
    return <div>Station not found</div>;
  }

  const rate = station.dcFastRate || station.level2Rate || 45;
  const estimatedKwh = parseInt(formData.duration) * 50; // rough
  const totalCost = (rate * estimatedKwh).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3">
            <ArrowLeft className="w-5 h-5" /> Back to Stations
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book Charging Slot</h1>
          <p className="text-gray-600 mt-1">{station.name}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Zap className="w-7 h-7 text-emerald-600" />
                  Charger Type
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {station.dcFastChargers > 0 && (
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="connectorType"
                        value="DC Fast"
                        checked={formData.connectorType === 'DC Fast'}
                        onChange={(e) => setFormData({...formData, connectorType: e.target.value})}
                        className="sr-only"
                      />
                      <div className={`p-6 border-2 rounded-xl transition-all ${formData.connectorType === 'DC Fast' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                        <p className="font-bold text-lg">DC Fast Charger</p>
                        <p className="text-sm text-gray-600">Up to 150 kW • {station.dcFastChargers} available</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-2">Rs. {station.dcFastRate || 60}/kWh</p>
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
                        onChange={(e) => setFormData({...formData, connectorType: e.target.value})}
                        className="sr-only"
                      />
                      <div className={`p-6 border-2 rounded-xl transition-all ${formData.connectorType === 'Level 2' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                        <p className="font-bold text-lg">Level 2 (AC)</p>
                        <p className="text-sm text-gray-600">22 kW • {station.level2Chargers} available</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-2">Rs. {station.level2Rate || 40}/kWh</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

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
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-3">
                    Duration
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                  >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                    <option value="4">4 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-4">
                  <Clock className="w-5 h-5 inline mr-2" /> Available Time Slots
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({...formData, timeSlot: slot})}
                      className={`py-4 rounded-xl font-medium text-lg transition-all ${
                        formData.timeSlot === slot
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                <div className="flex gap-4">
                  <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-amber-900">Free cancellation up to 30 minutes before</p>
                    <p className="text-sm text-amber-800">After that, 50% charge applies</p>
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
                    Confirm Booking • Rs. {totalCost}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h3>
              
              <div className="space-y-5 text-lg">
                <div className="flex items-start gap-4 pb-5 border-b">
                  <MapPin className="w-6 h-6 text-emerald-600 mt-1" />
                  <div>
                    <p className="font-bold">{station.name}</p>
                    <p className="text-gray-600 text-sm">{station.address}, {station.city}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Charger</span>
                    <span className="font-bold">{formData.connectorType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate</span>
                    <span className="font-bold text-emerald-600">Rs. {rate}/kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Energy</span>
                    <span className="font-bold">~{estimatedKwh} kWh</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-6 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total Amount</span>
                    <span className="text-3xl font-bold text-emerald-600">Rs. {totalCost}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}