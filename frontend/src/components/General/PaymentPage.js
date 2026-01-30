import React, { useState } from 'react';
import { CreditCard, Shield, Lock, ArrowLeft, CheckCircle, AlertCircle, Wallet } from 'lucide-react';

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedCard, setSelectedCard] = useState(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: true,
  });

  const bookingDetails = {
    station: 'Downtown Hub Charging Station',
    chargerType: 'Fast',
    power: '50 kW',
    date: '2024-10-15',
    timeSlot: '14:00',
    duration: '2 hours',
    rate: 0.45,
    estimatedEnergy: 50,
    subtotal: 22.50,
    serviceFee: 2.00,
    total: 24.50,
  };

  const savedCards = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 2, type: 'Mastercard', last4: '8888', expiry: '09/26', isDefault: false },
  ];

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    setPaymentData({...paymentData, cardNumber: value});
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setPaymentData({...paymentData, expiryDate: value});
  };

  const handlePayment = () => {
    console.log('Processing payment...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Schedule
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
          <p className="text-sm text-gray-500 mt-1">Complete your booking securely</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-green-900">Secure Payment Processing</p>
                  <p className="text-sm text-green-700">Your payment information is encrypted with 256-bit SSL</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                  <p className="text-sm font-medium text-gray-900">Card</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'wallet' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Wallet className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                  <p className="text-sm font-medium text-gray-900">Wallet</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('saved')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'saved' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                  <p className="text-sm font-medium text-gray-900">Saved</p>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={paymentData.cardName}
                      onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value.slice(0, 4)})}
                          maxLength={4}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={paymentData.saveCard}
                      onChange={(e) => setPaymentData({...paymentData, saveCard: e.target.checked})}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <label htmlFor="saveCard" className="text-sm text-gray-700">
                      <span className="font-medium">Save this card for future bookings</span>
                      <p className="text-xs text-gray-600 mt-1">Your card details will be securely stored</p>
                    </label>
                  </div>

                  <button
                    onClick={handlePayment}
                    className="w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-lg shadow-lg hover:shadow-xl"
                  >
                    Pay ${bookingDetails.total.toFixed(2)}
                  </button>
                </div>
              )}

              {paymentMethod === 'saved' && (
                <div className="space-y-4">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCard(card.id)}
                      className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedCard === card.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{card.type} •••• {card.last4}</p>
                            <p className="text-sm text-gray-600">Expires {card.expiry}</p>
                          </div>
                        </div>
                        {card.isDefault && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      {selectedCard === card.id && (
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="text-sm text-gray-600">Enter CVV for security</span>
                          <input
                            type="password"
                            placeholder="123"
                            maxLength={3}
                            onClick={(e) => e.stopPropagation()}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={handlePayment}
                    disabled={!selectedCard}
                    className="w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-lg shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Pay ${bookingDetails.total.toFixed(2)}
                  </button>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="space-y-4">
                  <button className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-all flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Pay</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Apple Pay</span>
                  </button>

                  <button className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-all flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">G</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Google Pay</span>
                  </button>

                  <button className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-all flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">PP</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">PayPal</span>
                  </button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Your payment is secure</p>
                  <p>We use industry-standard 256-bit SSL encryption. Your card details are never stored on our servers.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Accepted Payment Methods</h3>
              <div className="flex flex-wrap gap-4">
                <div className="w-16 h-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold shadow-md">VISA</div>
                <div className="w-16 h-10 bg-gradient-to-r from-red-600 to-orange-500 rounded flex items-center justify-center text-white text-xs font-bold shadow-md">MC</div>
                <div className="w-16 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded flex items-center justify-center text-white text-xs font-bold shadow-md">AMEX</div>
                <div className="w-16 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded flex items-center justify-center text-white text-xs font-bold shadow-md">DISC</div>
                <div className="w-16 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold shadow-md">PayPal</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By completing payment, you agree to our{' '}
                <button className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</button>
                {' '}and{' '}
                <button className="text-blue-600 hover:text-blue-700 font-medium">Cancellation Policy</button>
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border-2 border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="pb-3 border-b">
                  <p className="text-xs text-gray-500 mb-1">Station</p>
                  <p className="font-medium text-gray-900 text-sm">{bookingDetails.station}</p>
                </div>
                
                <div className="pb-3 border-b">
                  <p className="text-xs text-gray-500 mb-1">Charger Type</p>
                  <p className="font-medium text-gray-900">{bookingDetails.chargerType}</p>
                  <p className="text-xs text-gray-600">{bookingDetails.power}</p>
                </div>
                
                <div className="pb-3 border-b">
                  <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                  <p className="font-medium text-gray-900 text-sm">{bookingDetails.date}</p>
                  <p className="text-sm text-gray-700">{bookingDetails.timeSlot}</p>
                </div>
                
                <div className="pb-3 border-b">
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="font-medium text-gray-900">{bookingDetails.duration}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate</span>
                  <span className="font-medium text-gray-900">${bookingDetails.rate}/kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Est. Energy</span>
                  <span className="font-medium text-gray-900">~{bookingDetails.estimatedEnergy} kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">${bookingDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium text-gray-900">${bookingDetails.serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-3 border-t-2 border-gray-300">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">${bookingDetails.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    <span className="font-medium">Cancellation:</span> Free up to 1 hour before booking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}