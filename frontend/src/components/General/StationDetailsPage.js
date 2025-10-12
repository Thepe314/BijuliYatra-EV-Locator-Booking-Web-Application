import React, { useState } from 'react';
import { MapPin, Star, Zap, Clock, Navigation, Shield, Check, ArrowLeft, Phone, Share2, Heart, Info } from 'lucide-react';

export default function StationDetailsPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const station = {
    id: 1,
    name: 'Downtown Hub Charging Station',
    address: '123 Main Street, City Center, NY 10001',
    distance: '0.5 km',
    rating: 4.8,
    reviews: 234,
    available: 8,
    total: 10,
    amenities: ['WiFi', 'Cafe', 'Restroom', 'Covered Parking', 'Security', '24/7 Access'],
    chargerTypes: [
      { type: 'Standard', power: '7 kW', available: 3, price: 0.35, connector: 'Type 2', time: '6-8 hrs' },
      { type: 'Fast', power: '50 kW', available: 5, price: 0.45, connector: 'CCS', time: '1-2 hrs' },
      { type: 'Ultra Fast', power: '150 kW', available: 2, price: 0.60, connector: 'CCS2', time: '20-30 min' },
    ],
    hours: 'Open 24/7',
    phone: '+1 (555) 123-4567',
    description: 'Premium charging facility located in the heart of downtown. Features multiple charging options, comfortable waiting area with WiFi, and nearby restaurants and shopping.',
  };

  const reviews = [
    { id: 1, name: 'Sarah Johnson', rating: 5, date: '2 days ago', comment: 'Excellent location with great amenities. Fast charging and clean facilities.', verified: true },
    { id: 2, name: 'Mike Chen', rating: 5, date: '1 week ago', comment: 'Very convenient location. Staff is helpful and the charging speed is impressive.', verified: true },
    { id: 3, name: 'Emily Rodriguez', rating: 4, date: '2 weeks ago', comment: 'Good charging station but can get busy during peak hours. Overall a solid choice.', verified: true },
  ];

  const images = [
    { color: 'from-blue-400 via-blue-500 to-purple-600' },
    { color: 'from-green-400 via-teal-500 to-blue-600' },
    { color: 'from-purple-400 via-pink-500 to-red-600' },
    { color: 'from-orange-400 via-red-500 to-pink-600' },
  ];

  const handleBookNow = () => {
    // Navigate to booking page
    console.log('Navigate to booking page');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Map
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{station.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{station.distance} away</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{station.rating}</span>
                  <span className="text-sm text-gray-500">({station.reviews} reviews)</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isFavorite 
                    ? 'border-red-500 bg-red-50 text-red-600' 
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-600' : ''}`} />
              </button>
              <button className="p-3 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className={`h-96 bg-gradient-to-br ${images[activeImage].color} flex items-center justify-center text-white relative`}>
                <div className="text-center z-10">
                  <Zap className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-xl font-bold">Station Gallery - Image {activeImage + 1}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-20 rounded-lg bg-gradient-to-br ${img.color} transition-all ${
                      activeImage === idx ? 'ring-4 ring-blue-500' : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Station Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Station</h2>
              <p className="text-gray-600 mb-6">{station.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-green-700">Availability</p>
                  </div>
                  <p className="text-3xl font-bold text-green-900">{station.available}<span className="text-lg">/{station.total}</span></p>
                  <p className="text-xs text-green-600 mt-1">Chargers Available Now</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-medium text-blue-700">Operating Hours</p>
                  </div>
                  <p className="text-xl font-bold text-blue-900">{station.hours}</p>
                  <p className="text-xs text-blue-600 mt-1">Always Available</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium">{station.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="text-sm font-medium">{station.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Amenities & Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {station.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Charger Types */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Available Chargers</h3>
              <div className="space-y-4">
                {station.chargerTypes.map((charger, idx) => (
                  <div key={idx} className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{charger.type}</h4>
                        <p className="text-sm text-gray-600">Power: {charger.power} • Connector: {charger.connector}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">${charger.price}</p>
                        <p className="text-xs text-gray-600">per kWh</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Charging Time</p>
                        <p className="font-bold text-gray-900">{charger.time}</p>
                        <p className="text-xs text-gray-500">for 80% charge</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Availability</p>
                        <p className="font-bold text-gray-900">{charger.available} of {station.total}</p>
                        <p className="text-xs text-gray-500">units available</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        charger.available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {charger.available > 0 ? `${charger.available} Available` : 'Not Available'}
                      </span>
                      <span className="text-sm text-gray-600">Est. ${(charger.price * 50).toFixed(2)} for full charge</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900">{station.rating}</span>
                  <span className="text-gray-600">({station.reviews})</span>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900">{review.name}</p>
                          {review.verified && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors">
                View All {station.reviews} Reviews
              </button>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border-2 border-blue-100">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">Starting from</p>
                <p className="text-4xl font-bold text-blue-600">${station.chargerTypes[0].price}</p>
                <p className="text-xs text-gray-500 mt-1">per kWh</p>
              </div>

              <div className="space-y-3 mb-6">
                <button 
                  onClick={handleBookNow}
                  className="w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-lg shadow-lg hover:shadow-xl"
                >
                  Book Now
                </button>

                <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Secure Payment</p>
                    <p className="text-xs text-gray-600">256-bit SSL encryption</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Free Cancellation</p>
                    <p className="text-xs text-gray-600">Cancel up to 1 hour before</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Instant Confirmation</p>
                    <p className="text-xs text-gray-600">Receive booking immediately</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 text-center">
                  By booking, you agree to our Terms of Service and Cancellation Policy
                </p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-6">
              <p className="text-sm font-medium text-blue-900 mb-2">💡 Pro Tip</p>
              <p className="text-xs text-blue-800">
                This station is less busy between 10 AM - 2 PM on weekdays. Book in advance for guaranteed availability!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}