'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, Settings, FileText, TrendingUp, AlertCircle } from 'lucide-react';
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
              // First, try to parse as JSON directly (handles escaped quotes)
              responseList = JSON.parse(data.response);
              console.log('Chat - Successfully parsed as JSON:', responseList);
            } catch (parseError) {
              console.log('Chat - Failed to parse as JSON, trying to clean and parse');
              
              try {
                // Clean up the response string for parsing
                let cleanedResponse = data.response;
                
                // Handle the specific format: "[{'text': \"...\", 'type': 'text', 'index': 0}]"
                // Replace escaped quotes and single quotes
                cleanedResponse = cleanedResponse
                  .replace(/\\"/g, '"')  // Replace \" with "
                  .replace(/'/g, '"')    // Replace ' with "
                  .replace(/True/g, 'true')
                  .replace(/False/g, 'false');
                
                console.log('Chat - Cleaned response:', cleanedResponse);
                
                responseList = JSON.parse(cleanedResponse);
                console.log('Chat - Successfully parsed cleaned response:', responseList);
              } catch (secondParseError) {
                console.log('Chat - Failed to parse cleaned response, using regex fallback');
                
                // Fallback: Extract text using regex
                const textMatch = data.response.match(/"text":\s*"([^"]*)"/);
                if (textMatch && textMatch[1]) {
                  responseText = textMatch[1];
                  console.log('Chat - Extracted text using regex:', responseText);
                } else {
                  // Last resort: clean up the raw response
                  responseText = data.response
                    .replace(/[\[\]{}'"]/g, '')
                    .replace(/text:\s*/, '')
                    .replace(/type:\s*\w+/, '')
                    .replace(/index:\s*\d+/, '')
                    .trim();
                  console.log('Chat - Using cleaned raw response:', responseText);
                }
                responseList = null;
              }
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
        <button 
          onClick={() => setInputValue("add AMGN to my watchlist")}
          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-1"
        >
          <TrendingUp className="w-3 h-3" />
          Test AMGN Watchlist
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
