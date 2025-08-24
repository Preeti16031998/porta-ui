'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, Settings, AlertCircle } from 'lucide-react';
import { env } from '@/config/env';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
}

interface ChatApiResponse {
  response: string | any[] | any; // Can be string, array, or object
  user_id: string;
  session_id: string;
  status: string;
}

interface ChatProps {
  onPortfolioUpdate?: () => void;
}

export default function Chat({ onPortfolioUpdate }: ChatProps) {
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

  // Get user ID from environment
  const userId = process.env.NEXT_PUBLIC_USER_ID || 'f00dc8bd-eabc-4143-b1f0-fbcb9715a02e';

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

    try {
      console.log('Chat - Making API request to chat endpoint');
      console.log('Chat - Request payload:', { message: inputValue, user_id: userId });
      
      const response = await fetch(`${env.chat.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          user_id: userId
        }),
      });

      console.log('Chat - Response status:', response.status);
      console.log('Chat - Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chat - HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: ChatApiResponse = await response.json();
      console.log('Chat - Response data:', data);
      console.log('Chat - Response type:', typeof data.response);
      console.log('Chat - Is response array:', Array.isArray(data.response));

      if (data.status === 'success' && data.response) {
        // Parse the response to extract the text
        let responseText = '';
        try {
          let responseList;
          
          // Check if data.response is already an array (parsed JSON)
          if (Array.isArray(data.response)) {
            responseList = data.response;
          } else if (typeof data.response === 'string') {
            console.log('Chat - Raw response string:', data.response);
            
            try {
              // Try to parse as JSON directly
              responseList = JSON.parse(data.response);
              console.log('Chat - Successfully parsed as JSON:', responseList);
            } catch (parseError) {
              console.log('Chat - Failed to parse as JSON, using raw response');
              responseText = data.response;
              responseList = null;
            }
          } else {
            // If it's an object, try to extract text directly
            responseText = data.response.text || JSON.stringify(data.response);
            responseList = null;
          }
          
          // Extract text from the response list if it's an array
          if (Array.isArray(responseList) && responseList.length > 0) {
            responseText = responseList[0].text || 'No response text available';
            console.log('Chat - Extracted text from response list:', responseText);
          } else if (!responseText) {
            responseText = 'Invalid response format';
            console.log('Chat - No valid text found, using fallback');
          }
        } catch (parseError) {
          console.error('Chat - Error parsing response:', parseError);
          responseText = data.response || 'Error parsing response';
        }

        console.log('Chat - Final parsed responseText:', responseText);

        // Check if this response indicates a portfolio or watchlist update
        const isPortfolioUpdate = (
          // Portfolio operations
          (responseText.toLowerCase().includes('added') || 
           responseText.toLowerCase().includes('removed') ||
           responseText.toLowerCase().includes('successfully removed') ||
           responseText.toLowerCase().includes('updated') ||
           responseText.toLowerCase().includes('deleted') ||
           responseText.toLowerCase().includes('sold') ||
           responseText.toLowerCase().includes('bought') ||
           responseText.toLowerCase().includes('purchased')) && 
          (responseText.toLowerCase().includes('watchlist') || 
           responseText.toLowerCase().includes('portfolio') ||
           responseText.toLowerCase().includes('position') ||
           responseText.toLowerCase().includes('holding') ||
           responseText.toLowerCase().includes('shares') ||
           responseText.toLowerCase().includes('stock'))
        );

        if (isPortfolioUpdate && onPortfolioUpdate) {
          console.log('Chat - Detected portfolio/watchlist update, refreshing all components');
          // Small delay to ensure the API call completes
          setTimeout(() => {
            onPortfolioUpdate();
          }, 500);
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: responseText,
          timestamp: new Date(),
          context: 'AI Response',
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(`Invalid response from chat API: ${data.status}`);
      }
    } catch (error) {
      console.error('Chat - Error calling chat API:', error);
      
      let errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to the chat service. Please check if the service is running.';
        } else if (error.message.includes('HTTP error')) {
          errorMessage = 'The chat service returned an error. Please try again later.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
        context: 'Error',
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
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
    <div className="h-full flex flex-col bg-[#F1F3F4] rounded-xl shadow-lg border border-[#495057]/10">




      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message, index) => (
          <div key={message.id}>
            <div
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="w-10 h-10 bg-[#1B263B] rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className="max-w-[80%]">
                <div className={`text-sm leading-relaxed font-medium ${
                  message.type === 'user' ? 'text-[#1B263B]' : 'text-[#1B263B]'
                }`}>
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-[#495057]' : 'text-[#495057]'
                }`}>
                  {formatTime(message.timestamp)}
                  {message.context && (
                    <span className="ml-2 px-2 py-1 bg-white rounded-lg text-xs font-medium">
                      {message.context}
                    </span>
                  )}
                </div>
              </div>
              
              {message.type === 'user' && (
                <div className="w-10 h-10 bg-[#1B263B] rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-10 h-10 bg-[#1B263B] rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#1B263B] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#1B263B] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-[#1B263B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#F1F3F4]">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#495057]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent text-[#1B263B] placeholder-[#495057]/60"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="p-3 bg-[#1B263B] hover:bg-[#1B263B]/90 disabled:bg-[#495057]/30 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
