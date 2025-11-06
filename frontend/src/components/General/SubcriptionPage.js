import React, { useState } from 'react';
import { Check, Zap, TrendingUp, Shield, BarChart3, Users, ArrowRight } from 'lucide-react';

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: 'standard',
      name: 'Standard',
      description: 'Perfect for individual operators',
      monthlyPrice: 0,
      annualPrice: 0,
      popular: false,
      isFree: true,
      features: [
        'Up to 5 charging stations',
        'Basic analytics & reporting',
        'Email support',
        'Standard commission: 5%',
        'Monthly settlements',
        '24/7 uptime monitoring',
        'Mobile app access',
        'Community support'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'private',
      name: 'Private',
      description: 'Best for private businesses',
      monthlyPrice: 9999,
      annualPrice: 99990,
      popular: true,
      features: [
        'Unlimited charging stations',
        'Advanced analytics & reporting',
        'Priority email & phone support',
        'Reduced commission: 2.5%',
        'Weekly settlements',
        '99.9% uptime SLA',
        'Mobile app access',
        'Custom branding options',
        'API access',
        'Multi-user management',
        'Dedicated account manager'
      ],
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'government',
      name: 'Government',
      description: 'For government agencies & public sectors',
      monthlyPrice: 4999,
      annualPrice: 49990,
      popular: false,
      features: [
        'Unlimited charging stations',
        'Advanced analytics & reporting',
        'Priority support with dedicated team',
        'Special government commission: 1.5%',
        'Bi-weekly settlements',
        '99.99% uptime SLA',
        'Mobile app access',
        'White-label solution available',
        'Advanced API access',
        'Unlimited user management',
        'Custom integrations',
        'Free training & onboarding'
      ],
      color: 'from-green-500 to-emerald-600'
    }
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

  const formatPrice = (price) => {
    return price.toLocaleString('en-NP');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl">
              <Zap className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Subscription Plans</h1>
          <p className="text-xl text-slate-300 mb-8">Choose the perfect plan for your charging network</p>

          {/* Toggle Annual/Monthly */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-amber-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Annual <span className="text-amber-400 ml-2">Save 17%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                selectedPlan === plan.id
                  ? 'ring-2 ring-amber-500 shadow-2xl'
                  : 'hover:shadow-xl'
              } ${plan.popular ? 'md:scale-105 md:z-10' : ''}`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold py-2 text-center">
                  Most Popular
                </div>
              )}

              <div className={`bg-gradient-to-br ${plan.color} p-8 pb-6 text-white ${plan.popular ? 'pt-16' : 'pt-8'}`}>
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <p className="text-sm opacity-90 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.isFree ? (
                    <span className="text-5xl font-bold">FREE</span>
                  ) : (
                    <>
                      <span className="text-5xl font-bold">₹{formatPrice(isAnnual ? plan.annualPrice : plan.monthlyPrice)}</span>
                      <span className="text-sm opacity-90 ml-2">/{isAnnual ? 'year' : 'month'}</span>
                    </>
                  )}
                </div>

                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all mb-6 ${
                    selectedPlan === plan.id
                      ? 'bg-white text-slate-900 hover:bg-slate-100'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
                </button>
              </div>

              {/* Features */}
              <div className="bg-white/95 backdrop-blur-lg p-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 mb-12 border border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to get started?</h3>
              <p className="text-slate-300">Join BijuliYatra today and start earning from your charging network</p>
            </div>
            <button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap">
              Continue to Payment
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-8">Why Choose BijuliYatra?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex gap-4">
              <div className="bg-amber-500 p-3 rounded-lg h-fit">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">Easy Integration</h4>
                <p className="text-slate-400 text-sm">Seamlessly integrate your charging stations with our platform</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-500 p-3 rounded-lg h-fit">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">Real-time Analytics</h4>
                <p className="text-slate-400 text-sm">Track performance with advanced analytics and insights</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-green-500 p-3 rounded-lg h-fit">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">Secure & Reliable</h4>
                <p className="text-slate-400 text-sm">Bank-level security with 99.99% uptime guarantee</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-purple-500 p-3 rounded-lg h-fit">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">24/7 Support</h4>
                <p className="text-slate-400 text-sm">Dedicated support team ready to help anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h4 className="font-bold text-white mb-3">Can I upgrade or downgrade my plan?</h4>
              <p className="text-slate-300 text-sm">Yes, you can change your plan anytime. Changes take effect at the beginning of your next billing cycle.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h4 className="font-bold text-white mb-3">What payment methods do you accept?</h4>
              <p className="text-slate-300 text-sm">We accept all major credit cards, debit cards, and digital payment methods including Khalti and eSewa.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h4 className="font-bold text-white mb-3">Is there a free trial?</h4>
              <p className="text-slate-300 text-sm">Yes! New operators get a 14-day free trial on the Professional plan with full access to all features.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h4 className="font-bold text-white mb-3">Do you offer custom plans?</h4>
              <p className="text-slate-300 text-sm">Absolutely! Contact our sales team for Enterprise custom plans tailored to your specific needs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}