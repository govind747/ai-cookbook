import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';

interface ChatUIProps {
  agentName: string;
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isLoading: boolean;
}

export const ChatUI: React.FC<ChatUIProps> = ({
  agentName,
  onSendMessage,
  messages,
  isLoading,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <h2 className="text-xl font-bold">{agentName}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">
                Start a conversation with {agentName}
              </p>
              <p className="text-sm">Type a message below to begin</p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`
                max-w-[80%] rounded-2xl px-5 py-3 shadow-md
                ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                }
              `}
            >
              <div className="flex items-start gap-2">
                {message.role === 'assistant' && (
                  <span className="flex-shrink-0 text-lg">🤖</span>
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  {message.timestamp && (
                    <p
                      className={`text-xs mt-2 ${
                        message.role === 'user'
                          ? 'text-primary-200'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                {message.role === 'user' && (
                  <span className="flex-shrink-0 text-lg">👤</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            disabled={isLoading}
            rows={1}
            className="
              flex-1 resize-none rounded-lg px-4 py-3
              bg-gray-100 dark:bg-gray-700
              text-gray-900 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              border-2 border-transparent
              focus:border-primary-500 focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="
              px-6 py-3 rounded-lg font-semibold
              bg-gradient-to-r from-primary-600 to-primary-700
              text-white shadow-md
              hover:from-primary-700 hover:to-primary-800
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              transform hover:scale-105 active:scale-95
            "
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
