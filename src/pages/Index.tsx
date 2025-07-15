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
          /* Enhanced Analytics Dashboard */
          <div className="space-y-6">
            {/* Dashboard Header with KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-card border border-border/50 rounded-lg p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rows</p>
                    <p className="text-2xl font-bold text-foreground">{originalData.length.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-card border border-border/50 rounded-lg p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Filter className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Filtered Rows</p>
                    <p className="text-2xl font-bold text-foreground">{filteredData.length.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-card border border-border/50 rounded-lg p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Columns</p>
                    <p className="text-2xl font-bold text-foreground">{columns.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-card border border-border/50 rounded-lg p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                    <Download className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dataset</p>
                    <p className="text-lg font-semibold text-foreground truncate" title={fileName}>
                      {fileName.length > 12 ? `${fileName.substring(0, 12)}...` : fileName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Panel - Filters & Controls */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Data Controls</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportData('csv')}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Export
                  </Button>
                </div>
                <DataFilter 
                  data={originalData} 
                  columns={columns} 
                  onFilterChange={handleFilterChange}
                />
                <Button
                  variant="outline"
                  className="w-full"
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

              {/* Center Panel - Visualizations */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Data Visualization</h3>
                  <Badge variant="secondary" className="text-xs">
                    Interactive Charts
                  </Badge>
                </div>
                <DataVisualization data={filteredData} columns={columns} />
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Statistical Summary</h3>
                  <DataSummary data={filteredData} columns={columns} />
                </div>
              </div>

              {/* Right Panel - AI Assistant */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">AI Assistant</h3>
                  <Badge variant="default" className="text-xs bg-gradient-primary">
                    Powered by Gemini
                  </Badge>
                </div>
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
