import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';

export default function CPOChatbot() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your CPO Assistant. I can help you with station management, troubleshooting, billing, and more. How can I assist you today?',
      timestamp: new Date(),
      suggestions: ['Station Issues', 'Revenue Reports', 'Add New Station', 'Pricing Help']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickResponses = {
    'station issues': {
      text: 'I can help with station issues. What specific problem are you experiencing?',
      suggestions: ['Charger Offline', 'Low Utilization', 'Maintenance Alert', 'Connection Error']
    },
    'charger offline': {
      text: 'Let me help you troubleshoot the offline charger. Here are some common solutions:\n\n1. Check power supply and circuit breakers\n2. Verify network connectivity\n3. Restart the charging unit\n4. Check for error codes on the display\n\nWhich station is affected?',
      suggestions: ['Downtown Hub', 'Mall Plaza', 'Airport Station', 'Tech Park']
    },
    'revenue reports': {
      text: 'I can generate revenue reports for you. What time period would you like to see?',
      suggestions: ['Last 7 Days', 'Last Month', 'Last Quarter', 'Custom Range']
    },
    'add new station': {
      text: 'Great! Let\'s add a new charging station. I\'ll need some information:\n\n1. Station name\n2. Location address\n3. Number of chargers\n4. Charger types (Level 2 or DC Fast)\n\nShall we start with the station name?',
      suggestions: ['Yes, Continue', 'Cancel']
    },
    'pricing help': {
      text: 'I can help you with pricing configuration. What would you like to do?',
      suggestions: ['View Current Rates', 'Update Pricing', 'Enable Peak Hours', 'Pricing Strategy']
    },
    'low utilization': {
      text: 'Low utilization can be improved through several strategies:\n\n• Review pricing competitiveness\n• Increase marketing visibility\n• Check location accessibility\n• Optimize peak hour pricing\n• Partner with local businesses\n\nWould you like detailed recommendations for a specific station?',
      suggestions: ['Yes, Show Recommendations', 'View Analytics']
    },
    'maintenance alert': {
      text: 'I see you have maintenance alerts. Here are the current issues:\n\n• Airport Station - Charger 3 requires inspection\n• Downtown Hub - Scheduled maintenance due\n\nWould you like to schedule maintenance or view details?',
      suggestions: ['Schedule Maintenance', 'View Details', 'Dismiss Alert']
    },
    'view current rates': {
      text: 'Here are your current pricing rates:\n\n• Level 2 (AC): $0.35/kWh\n• DC Fast Charging: $0.45/kWh\n• Peak Hour Pricing: Disabled\n\nWould you like to make any changes?',
      suggestions: ['Update Rates', 'Enable Peak Hours', 'Keep Current']
    },
    'last month': {
      text: 'Here\'s your revenue summary for last month:\n\n💰 Total Revenue: $21,300\n⚡ Total Sessions: 512\n📊 Average per Session: $41.60\n📈 Growth: +12.8%\n\nWould you like a detailed breakdown or export this report?',
      suggestions: ['Detailed Breakdown', 'Export PDF', 'Compare to Previous']
    },
    'downtown hub': {
      text: 'Downtown Hub Station Details:\n\n📍 Location: Main St\n⚡ Chargers: 6/8 Active\n💵 Monthly Revenue: $2,340\n📊 Utilization: 75%\n\nWhat would you like to do?',
      suggestions: ['View Analytics', 'Check Status', 'Maintenance', 'Update Settings']
    },
    'help': {
      text: 'I\'m here to help! I can assist with:\n\n• Station management and monitoring\n• Troubleshooting charger issues\n• Revenue and analytics reports\n• Pricing configuration\n• Adding new stations\n• Maintenance scheduling\n\nWhat do you need help with?',
      suggestions: ['Station Issues', 'Revenue Reports', 'Pricing Help', 'Add Station']
    }
  };

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(quickResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    if (lowerMessage.includes('thank')) {
      return {
        text: 'You\'re welcome! Is there anything else I can help you with?',
        suggestions: ['View Dashboard', 'Check Alerts', 'No, That\'s All']
      };
    }

    return {
      text: 'I understand you\'re asking about: "' + userMessage + '"\n\nCould you provide more details, or would you like to explore one of these common topics?',
      suggestions: ['Station Management', 'Revenue Analytics', 'Technical Support', 'Talk to Human']
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotResponse(currentInput);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse.text,
        timestamp: new Date(),
        suggestions: botResponse.suggestions
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: suggestion,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotResponse(suggestion);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse.text,
        timestamp: new Date(),
        suggestions: botResponse.suggestions
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-6 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Bot className="w-5 h-5" />
          <span className="font-medium">CPO Assistant</span>
          <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {messages.length}
          </span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">CPO Assistant</h3>
                <p className="text-xs text-blue-100">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'bot' ? 'bg-blue-100' : 'bg-gray-200'
                  }`}>
                    {message.type === 'bot' ? (
                      <Bot className="w-5 h-5 text-blue-600" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className={`rounded-2xl p-3 ${
                      message.type === 'bot' 
                        ? 'bg-white border border-gray-200' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {formatTime(message.timestamp)}
                    </p>
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50 transition"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Powered by AI • Available 24/7
            </p>
          </div>
        </div>
      )}
    </div>
  );
}