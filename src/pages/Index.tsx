import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataSummary } from '@/components/DataSummary';
import { DataVisualization } from '@/components/DataVisualization';
import { DataFilter } from '@/components/DataFilter';
import { ChatInterface } from '@/components/ChatInterface';
import { Brain, BarChart3, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);

  const handleFileUpload = (uploadedData: any[], uploadedFileName: string) => {
    setOriginalData(uploadedData);
    setFilteredData(uploadedData);
    setFileName(uploadedFileName);
    setColumns(uploadedData.length > 0 ? Object.keys(uploadedData[0]) : []);
  };

  const handleFilterChange = (newFilteredData: any[]) => {
    setFilteredData(newFilteredData);
  };

  const exportData = (format: string) => {
    if (format === 'csv') {
      const csvContent = [
        columns.join(','),
        ...filteredData.map(row => columns.map(col => `"${row[col]}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace('.csv', '')}_filtered.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-card shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Analytics Platform</h1>
                <p className="text-muted-foreground">Intelligent data analysis with conversational insights</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">by Srimanth Adep</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
      {!originalData.length ? (
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
          /* Comprehensive Dashboard State */
          <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">Dataset: {fileName}</Badge>
                  <Badge variant="secondary">
                    {filteredData.length} of {originalData.length} rows
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('csv')}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setOriginalData([]);
                    setFilteredData([]);
                    setFileName('');
                    setColumns([]);
                  }}
                >
                  Upload New Dataset
                </Button>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Filters */}
              <div className="lg:col-span-1 space-y-4">
                <DataFilter 
                  data={originalData} 
                  columns={columns} 
                  onFilterChange={handleFilterChange}
                />
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                <DataSummary data={filteredData} columns={columns} />
                <DataVisualization data={filteredData} columns={columns} />
              </div>

              {/* Right Sidebar - AI Chat */}
              <div className="lg:col-span-1">
                <ChatInterface data={filteredData} dataColumns={columns} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              © {new Date().getFullYear()} Srimanth Adep. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
