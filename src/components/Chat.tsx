'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, Settings, FileText, TrendingUp, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm Porta, your AI portfolio research assistant. I can help you analyze your holdings, explain market events, and provide insights about your investments. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        context: 'Portfolio Analysis',
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('apple') || input.includes('aapl')) {
      return "Apple (AAPL) represents 15.2% of your portfolio. Recent Q2 earnings beat estimates with 8% revenue growth. The Services segment accelerated to 14% growth, and iPhone sales in China exceeded expectations. Your position is performing well despite broader market volatility.";
    }
    
    if (input.includes('technology') || input.includes('tech')) {
      return "Your Technology sector allocation is 44.2%, which is overweight compared to the S&P 500. This includes AAPL (15.2%), MSFT (12.8%), GOOGL (10.5%), and NVDA (7.9%). The sector is currently down -0.8% today, driving most of your portfolio's decline.";
    }
    
    if (input.includes('performance') || input.includes('how am i doing')) {
      return "Your portfolio is up +$1,253 (+0.85%) today. Top performers: NVDA (+2.81%), AMZN (+1.86%), MSFT (+0.37%). Areas of concern: TSLA (-2.08%), AAPL (-1.21%). Overall, you're outperforming the S&P 500 by 0.3 percentage points today.";
    }
    
    if (input.includes('risk') || input.includes('volatility')) {
      return "Your portfolio shows moderate risk with 44.2% in Technology (higher volatility) and 30.1% in Financial Services (lower volatility). Consider diversifying into Healthcare (15.8%) and Consumer Discretionary (9.9%) for better risk-adjusted returns.";
    }
    
    if (input.includes('earnings') || input.includes('events')) {
      return "Upcoming events: AAPL earnings on Jan 25 (2:30 PM), MSFT product launch on Jan 26 (10:00 AM), NVDA earnings on Jan 29 (1:00 PM). These are high-impact events that could significantly affect your portfolio performance.";
    }
    
    return "I can help you analyze your portfolio performance, explain market events, assess risk, and provide insights about specific holdings. Try asking about a specific stock, sector performance, or portfolio risk analysis.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Porta AI Assistant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500">Portfolio Research & Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <Settings className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Portfolio Review
        </button>
        <button className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-xs hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Risk Analysis
        </button>
        <button className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg text-xs hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Market Update
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type === 'assistant' && (
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
              }`}
            >
              <div className="text-sm leading-relaxed">{message.content}</div>
              <div className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {formatTime(message.timestamp)}
                {message.context && (
                  <span className="ml-2 px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-xs">
                    {message.context}
                  </span>
                )}
              </div>
            </div>
            
            {message.type === 'user' && (
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your portfolio..."
          className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isTyping}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
