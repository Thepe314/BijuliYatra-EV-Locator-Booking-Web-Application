import React, { useState } from 'react';
import { MapPin, Star, Zap, Clock, DollarSign, Navigation, Calendar, CreditCard, Check, ArrowLeft, Shield, AlertCircle } from 'lucide-react';

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Schedule, 2: Payment, 3: Confirmation
  
  const [bookingData, setBookingData] = useState({
    date: '',
    timeSlot: '',
    duration: '2',
    chargerType: 'fast',
    vehicle: 'tesla-model3',
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: true,
  });

  // Station Details (passed from previous page)
  const station = {
    id: 1,
    name: 'Downtown Hub Charging Station',
    address: '123 Main Street, City Center',
    price: 0.45,
    chargerTypes: [
      { type: 'Standard', power: '7 kW', price: 0.35 },
      { type: 'Fast', power: '50 kW', price: 0.45 },
      { type: 'Ultra Fast', power: '150 kW', price: 0.60 },
    ],
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const vehicles = [
    { id: 'tesla-model3', name: 'Tesla Model 3', battery: '75 kWh' },
    { id: 'tesla-modelx', name: 'Tesla Model X', battery: '100 kWh' },
    { id: 'nissan-leaf', name: 'Nissan Leaf', battery: '62 kWh' },
  ];

  const selectedCharger = station.chargerTypes.find(c => c.type.toLowerCase().replace(' ', '') === bookingData.chargerType);
  const estimatedEnergy = parseInt(bookingData.duration) * 25;
  const estimatedCost = selectedCharger ? (selectedCharger.price * estimatedEnergy).toFixed(2) : '0.00';
  const totalCost = (parseFloat(estimatedCost) + 2).toFixed(2);
  const bookingId = `BK${Math.floor(Math.random() * 10000)}`;

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(3);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {currentStep > 1 && (
            <button 
              onClick={() => setCurrentStep(currentStep - 1)} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {currentStep === 1 && 'Schedule Your Charging'}
            {currentStep === 2 && 'Payment Details'}
            {currentStep === 3 && 'Booking Confirmed'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{station.name}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3].map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step ? <Check className="w-6 h-6" /> : step}
                  </div>
                  <p className="text-xs mt-2 font-medium text-gray-600">
                    {step === 1 ? 'Schedule' : step === 2 ? 'Payment' : 'Confirm'}
                  </p>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-4 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Schedule */}
            {currentStep === 1 && (
              <form onSubmit={handleScheduleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Zap className="w-4 h-4 inline mr-1" />
                    Select Charger Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {station.chargerTypes.map((charger) => {
                      const typeId = charger.type.toLowerCase().replace(' ', '');
                      return (
                        <button
                          key={typeId}
                          type="button"
                          onClick={() => setBookingData({...bookingData, chargerType: typeId})}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            bookingData.chargerType === typeId
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <p className="font-bold text-gray-900 mb-1">{charger.type}</p>
                          <p className="text-xs text-gray-600 mb-2">{charger.power}</p>
                          <p className="text-lg font-bold text-blue-600">${charger.price}/kWh</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      value={bookingData.duration}
                      onChange={(e) => setBookingData({...bookingData, duration: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0.5">30 minutes</option>
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Select Time Slot
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setBookingData({...bookingData, timeSlot: time})}
                        className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                          bookingData.timeSlot === time
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vehicle
                  </label>
                  <select
                    value={bookingData.vehicle}
                    onChange={(e) => setBookingData({...bookingData, vehicle: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.battery}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900 mb-1">Cancellation Policy</p>
                      <p className="text-sm text-amber-800">Free cancellation up to 1 hour before your booking. Late cancellations may incur a $5 fee.</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!bookingData.date || !bookingData.timeSlot}
                  className="w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-lg"
                >
                  Proceed to Payment
                </button>
              </form>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-bold text-gray-900">Secure Payment</p>
                      <p className="text-sm text-gray-600">Your payment information is encrypted</p>
                    </div>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CreditCard className="w-4 h-4 inline mr-1" />
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                        maxLength="19"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={paymentData.cardName}
                        onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentData.expiryDate}
                          onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                          maxLength="5"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                          maxLength="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="saveCard"
                        checked={paymentData.saveCard}
                        onChange={(e) => setPaymentData({...paymentData, saveCard: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="saveCard" className="text-sm text-gray-700">
                        Save card for future bookings
                      </label>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-medium mb-1">Your payment is secure</p>
                          <p>We use industry-standard encryption to protect your payment information.</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-lg"
                    >
                      Pay ${totalCost}
                    </button>

                    <p className="text-xs text-center text-gray-500">
                      By confirming payment, you agree to our Terms of Service and Cancellation Policy
                    </p>
                  </form>
                </div>

                {/* Accepted Payment Methods */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Accepted Payment Methods</h3>
                  <div className="flex gap-4">
                    <div className="w-16 h-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div className="w-16 h-10 bg-gradient-to-r from-red-600 to-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      MC
                    </div>
                    <div className="w-16 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">
                      AMEX
                    </div>
                    <div className="w-16 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      Pay
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Booking Confirmed!</h2>
                  <p className="text-gray-600 mb-8">Your charging station has been successfully reserved</p>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mb-8 max-w-md mx-auto">
                    <p className="text-sm text-gray-600 mb-2">Booking ID</p>
                    <p className="font-mono font-bold text-2xl text-gray-900 mb-6">#{bookingId}</p>
                    
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-sm text-gray-600">Station</span>
                        <span className="font-medium text-gray-900 text-sm">{station.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-sm text-gray-600">Date & Time</span>
                        <span className="font-medium text-gray-900 text-sm">{bookingData.date} at {bookingData.timeSlot}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-sm text-gray-600">Duration</span>
                        <span className="font-medium text-gray-900 text-sm">{bookingData.duration} hour(s)</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-sm text-gray-600">Charger Type</span>
                        <span className="font-medium text-gray-900 text-sm capitalize">{selectedCharger?.type}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Total Paid</span>
                        <span className="font-bold text-blue-600 text-lg">${totalCost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                    <p className="text-sm text-blue-900">
                      <span className="font-medium">Confirmation sent!</span> Check your email for booking details and directions.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <button className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      View Booking
                    </button>
                    <button className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </button>
                  </div>

                  <button className="mt-6 text-blue-600 hover:text-blue-700 font-medium">
                    Book Another Station
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">
                {currentStep === 1 && 'Booking Summary'}
                {currentStep === 2 && 'Order Summary'}
                {currentStep === 3 && 'Receipt'}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="pb-3 border-b">
                  <p className="text-sm text-gray-600 mb-1">Station</p>
                  <p className="font-medium text-gray-900 text-sm">{station.name}</p>
                </div>
                
                {bookingData.chargerType && selectedCharger && (
                  <div className="pb-3 border-b">
                    <p className="text-sm text-gray-600 mb-1">Charger Type</p>
                    <p className="font-medium text-gray-900">{selectedCharger.type}</p>
                    <p className="text-xs text-gray-600">{selectedCharger.power}</p>
                  </div>
                )}
                
                {bookingData.date && bookingData.timeSlot && (
                  <div className="pb-3 border-b">
                    <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                    <p className="font-medium text-gray-900 text-sm">{bookingData.date}</p>
                    <p className="text-sm text-gray-700">{bookingData.timeSlot}</p>
                  </div>
                )}
                
                <div className="pb-3 border-b">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-medium text-gray-900">{bookingData.duration} hour(s)</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate</span>
                  <span className="font-medium">${selectedCharger?.price}/kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Est. Energy</span>
                  <span className="font-medium">~{estimatedEnergy} kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${estimatedCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">$2.00</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-blue-600">${totalCost}</span>
                </div>
              </div>

              {currentStep === 3 && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    Payment successful via {paymentData.cardName ? '****' + paymentData.cardNumber.slice(-4) : 'card'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}