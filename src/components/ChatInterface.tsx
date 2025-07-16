import { useState } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  data: any[];
  dataColumns: string[];
}

export function ChatInterface({ data, dataColumns }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI analytics assistant. I can help you analyze your data, answer questions about your dataset, and provide insights. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Example prompts for users
  const examplePrompts = [
    'What are the top 5 categories in my data?',
    'Show me a summary of numeric columns.',
    'Are there any outliers in the dataset?',
    'What trends can you find in the data?',
    'Suggest a chart for visualizing this data.',
    'How many unique values are in each column?',
    'What is the average of column X?',
    'Find missing values in the dataset.'
  ];

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare context about the data
      const dataContext = {
        rowCount: data.length,
        columns: dataColumns,
        sampleData: data.slice(0, 3),
        dataTypes: dataColumns.reduce((acc, col) => {
          const sampleValue = data[0]?.[col];
          acc[col] = typeof sampleValue === 'number' ? 'numeric' : 'text';
          return acc;
        }, {} as Record<string, string>)
      };

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDucsN8nesEvZpFjTXFcT00m0FslVBcY8I', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI data analyst assistant. Here's information about the current dataset:

Dataset Context:
- Total rows: ${dataContext.rowCount}
- Columns: ${dataContext.columns.join(', ')}
- Data types: ${JSON.stringify(dataContext.dataTypes)}
- Sample data: ${JSON.stringify(dataContext.sampleData)}

User question: ${inputValue}

Please provide a helpful analysis or answer based on this data context. Be specific and actionable in your response.`
            }]
          }]
        })
      });

      const result = await response.json();
      const assistantResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process your request.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] bg-gradient-card border-border/50 shadow-card">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Analytics Assistant</h3>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* Example Prompts */}
        <div className="mb-4">
          <div className="text-xs text-muted-foreground mb-1">Try asking:</div>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                className="px-2 py-1 rounded border border-border/50 text-xs text-foreground bg-background hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                onClick={() => setInputValue(prompt)}
                type="button"
                aria-label={`Use example prompt: ${prompt}`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4" role="list">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
              role="listitem"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-accent text-accent-foreground'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Loader className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                <p className="text-sm">Analyzing your data...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your data..."
            className="flex-1"
            disabled={isLoading}
            aria-label="Chat input: Ask me anything about your data"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-primary hover:opacity-90"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}