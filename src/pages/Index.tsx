import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataSummary } from '@/components/DataSummary';
import { DataVisualization } from '@/components/DataVisualization';
import { ChatInterface } from '@/components/ChatInterface';
import { Brain, BarChart3 } from 'lucide-react';

const Index = () => {
  const [data, setData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);

  const handleFileUpload = (uploadedData: any[], uploadedFileName: string) => {
    setData(uploadedData);
    setFileName(uploadedFileName);
    setColumns(uploadedData.length > 0 ? Object.keys(uploadedData[0]) : []);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-card shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Analytics Platform</h1>
              <p className="text-muted-foreground">Intelligent data analysis with conversational insights</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!data.length ? (
          /* Upload State */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Transform Your Data Into Insights
              </h2>
              <p className="text-lg text-muted-foreground">
                Upload your dataset and let AI help you discover patterns, trends, and actionable insights
              </p>
            </div>
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        ) : (
          /* Dashboard State */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                <p className="text-muted-foreground">Analyzing: {fileName}</p>
              </div>
              <button
                onClick={() => {
                  setData([]);
                  setFileName('');
                  setColumns([]);
                }}
                className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Upload New Dataset
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Summary & Visualizations */}
              <div className="lg:col-span-2 space-y-8">
                <DataSummary data={data} columns={columns} />
                <DataVisualization data={data} columns={columns} />
              </div>

              {/* Right Column - Chat Interface */}
              <div className="lg:col-span-1">
                <ChatInterface data={data} dataColumns={columns} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
