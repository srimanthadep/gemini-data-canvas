import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataSummary } from '@/components/DataSummary';
import { DataVisualization } from '@/components/DataVisualization';
import { DataFilter } from '@/components/DataFilter';
import { ChatInterface } from '@/components/ChatInterface';
import { DataPreviewTable } from '@/components/DataPreviewTable';
import { Brain, BarChart3, Filter, Download, Moon, Sun, Info, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { debounce } from '@/lib/utils';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [proceedToDashboard, setProceedToDashboard] = useState(false);

  // Theme toggle logic
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleFileUpload = (uploadedData: any[], uploadedFileName: string) => {
    setOriginalData(uploadedData);
    setFilteredData(uploadedData);
    setFileName(uploadedFileName);
    setColumns(uploadedData.length > 0 ? Object.keys(uploadedData[0]) : []);
  };

  // Debounced filter handler
  const debouncedSetFilteredData = React.useRef(debounce((data: any[]) => setFilteredData(data), 300)).current;
  const handleFilterChange = (newFilteredData: any[]) => {
    debouncedSetFilteredData(newFilteredData);
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

  // Quick filter presets
  const applyTop10 = () => setFilteredData(filteredData.slice(0, 10));
  const applyRemoveNulls = () => {
    setFilteredData(filteredData.filter(row =>
      Object.values(row).every(val => val !== null && val !== '' && val !== undefined)
    ));
  };

  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('onboardingComplete') !== 'true';
    }
    return true;
  });
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboardingComplete', 'true');
  };

  // Filter and chart customization state/undo/redo
  const [filters, setFilters] = useState([]);
  const [filterUndoStack, setFilterUndoStack] = useState([]);
  const [filterRedoStack, setFilterRedoStack] = useState([]);
  const [chartState, setChartState] = useState({
    chartType: 'bar',
    colorTheme: 'primary',
    chartSize: 400,
    selectedXAxis: '',
    selectedYAxis: '',
    chartTitle: '',
    xAxisLabel: '',
    yAxisLabel: ''
  });
  const [chartUndoStack, setChartUndoStack] = useState([]);
  const [chartRedoStack, setChartRedoStack] = useState([]);

  // Filter undo/redo handlers
  const handleSetFilters = (newFilters) => {
    setFilterUndoStack((stack) => [...stack, filters]);
    setFilterRedoStack([]);
    setFilters(newFilters);
  };
  const handleUndoFilter = () => {
    if (filterUndoStack.length) {
      setFilterRedoStack((stack) => [filters, ...stack]);
      const prev = filterUndoStack[filterUndoStack.length - 1];
      setFilters(prev);
      setFilterUndoStack((stack) => stack.slice(0, -1));
      toast({ title: 'Undo filter', description: 'Reverted to previous filter state.' });
    }
  };
  const handleRedoFilter = () => {
    if (filterRedoStack.length) {
      setFilterUndoStack((stack) => [...stack, filters]);
      const next = filterRedoStack[0];
      setFilters(next);
      setFilterRedoStack((stack) => stack.slice(1));
      toast({ title: 'Redo filter', description: 'Reapplied filter state.' });
    }
  };

  // Chart customization undo/redo handlers
  const handleSetChartState = (newState) => {
    setChartUndoStack((stack) => [...stack, chartState]);
    setChartRedoStack([]);
    setChartState(newState);
  };
  const handleUndoChart = () => {
    if (chartUndoStack.length) {
      setChartRedoStack((stack) => [chartState, ...stack]);
      const prev = chartUndoStack[chartUndoStack.length - 1];
      setChartState(prev);
      setChartUndoStack((stack) => stack.slice(0, -1));
      toast({ title: 'Undo chart change', description: 'Reverted to previous chart state.' });
    }
  };
  const handleRedoChart = () => {
    if (chartRedoStack.length) {
      setChartUndoStack((stack) => [...stack, chartState]);
      const next = chartRedoStack[0];
      setChartState(next);
      setChartRedoStack((stack) => stack.slice(1));
      toast({ title: 'Redo chart change', description: 'Reapplied chart state.' });
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleTheme();
        toast({ title: 'Theme switched', description: `Now in ${theme === 'dark' ? 'light' : 'dark'} mode.` });
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (filteredData.length && columns.length) {
          exportData('csv');
          toast({ title: 'Exported CSV', description: 'Filtered data exported as CSV.' });
        }
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setOriginalData([]);
        setFilteredData([]);
        setFileName('');
        setColumns([]);
        setProceedToDashboard(false);
        toast({ title: 'Upload triggered', description: 'Ready to upload a new dataset.' });
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndoFilter();
        handleUndoChart();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedoFilter();
        handleRedoChart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme, filteredData, columns, filterUndoStack, filterRedoStack, chartUndoStack, chartRedoStack]);

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
                <h1 className="text-2xl font-bold text-foreground">Dashbord.AI</h1>
                <p className="text-muted-foreground">Intelligent data analysis with conversational insights</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="rounded-full p-2 border border-border/50 bg-background hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</TooltipContent>
              </Tooltip>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Show help / onboarding">
                    <span className="sr-only">Show help</span>
                    <Brain className="w-5 h-5 text-primary" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Welcome to Dashbord.AI!</DialogTitle>
                    <DialogDescription>
                      <ul className="list-disc pl-6 space-y-2 mt-4 text-left">
                        <li><b>Upload Data:</b> Start by uploading a CSV file to preview and analyze your data.</li>
                        <li><b>Data Preview:</b> See a quick preview of your dataset before diving into analysis.</li>
                        <li><b>Dashboard:</b> Explore interactive charts, KPIs, and statistical summaries.</li>
                        <li><b>AI Assistant:</b> Ask questions about your data or request insights using natural language.</li>
                        <li><b>Filters:</b> Use advanced filters and quick presets to focus your analysis.</li>
                        <li><b>Export:</b> Download filtered data or charts as CSV, PNG, or PDF.</li>
                        <li><b>Theme Switch:</b> Toggle between light and dark mode for your comfort.</li>
                        <li><b>Accessibility:</b> Fully keyboard accessible and screen reader friendly.</li>
                      </ul>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button onClick={handleCloseOnboarding}>Get Started</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Show keyboard shortcuts">
                    <span className="sr-only">Show keyboard shortcuts</span>
                    <Info className="w-5 h-5 text-accent" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                    <DialogDescription>
                      <ul className="list-disc pl-6 space-y-2 mt-4 text-left">
                        <li><b>Ctrl + K</b>: Toggle theme (light/dark)</li>
                        <li><b>Ctrl + E</b>: Export filtered data as CSV</li>
                        <li><b>Ctrl + U</b>: Upload new dataset (reset)</li>
                        <li><b>Ctrl + Z</b>: Undo last filter/chart change</li>
                        <li><b>Ctrl + Y</b>: Redo last filter/chart change</li>
                      </ul>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button>Close</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <p className="text-sm text-muted-foreground">by Srimanth Adep</p>
            </div>
          </div>
        </div>
      </header>
      {/* Onboarding modal on first visit */}
      {showOnboarding && (
        <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Welcome to Dashbord.AI!</DialogTitle>
              <DialogDescription>
                <ul className="list-disc pl-6 space-y-2 mt-4 text-left">
                  <li><b>Upload Data:</b> Start by uploading a CSV file to preview and analyze your data.</li>
                  <li><b>Data Preview:</b> See a quick preview of your dataset before diving into analysis.</li>
                  <li><b>Dashboard:</b> Explore interactive charts, KPIs, and statistical summaries.</li>
                  <li><b>AI Assistant:</b> Ask questions about your data or request insights using natural language.</li>
                  <li><b>Filters:</b> Use advanced filters and quick presets to focus your analysis.</li>
                  <li><b>Export:</b> Download filtered data or charts as CSV, PNG, or PDF.</li>
                  <li><b>Theme Switch:</b> Toggle between light and dark mode for your comfort.</li>
                  <li><b>Accessibility:</b> Fully keyboard accessible and screen reader friendly.</li>
                </ul>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button onClick={handleCloseOnboarding}>Get Started</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {!originalData.length ? (
          /* Upload State */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Transform Your Data Into Insights
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Upload your dataset and let AI help you discover patterns, trends, and actionable insights
              </p>
            </div>
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        ) : !proceedToDashboard ? (
          // Data Preview State
          <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background">
            <div className="w-full max-w-7xl px-2 sm:px-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 text-center">Preview Your Data</h2>
              <div className="overflow-x-auto w-full">
                <DataPreviewTable data={originalData} columns={columns} rowCount={10} />
              </div>
              <div className="flex justify-center mt-8">
                <Button onClick={() => setProceedToDashboard(true)} size="lg">
                  Proceed to Dashboard
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Enhanced Analytics Dashboard */
          <div className="flex flex-col gap-4 sm:gap-6 min-h-[80vh]">
            {/* KPIs Row with Data Controls beside Dataset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 items-start">
              <div className="bg-gradient-card border border-border/50 rounded-lg p-3 shadow-card flex items-center gap-3 max-w-xs min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Rows</p>
                  <p className="text-2xl font-bold text-foreground">{originalData.length.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-gradient-card border border-border/50 rounded-lg p-3 shadow-card flex items-center gap-3 max-w-xs min-w-0">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Filter className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Filtered Rows</p>
                  <p className="text-2xl font-bold text-foreground">{filteredData.length.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-gradient-card border border-border/50 rounded-lg p-3 shadow-card flex items-center gap-3 max-w-xs min-w-0">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Columns</p>
                  <p className="text-2xl font-bold text-foreground">{columns.length}</p>
                </div>
              </div>
              <div className="bg-gradient-card border border-border/50 rounded-lg p-3 shadow-card flex items-center gap-3 max-w-xs min-w-0">
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
              {/* Data Controls beside Dataset */}
              <div className="flex flex-col gap-2 min-w-[180px]">
                <div className="flex items-center justify-between gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportData('csv')}
                        className="flex items-center gap-1 px-2 min-w-0 text-xs"
                      >
                        <Download className="w-3 h-3" />
                        Export
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export data as CSV</TooltipContent>
                  </Tooltip>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 px-2 min-w-0 text-xs"
                    onClick={() => {
                      setOriginalData([]);
                      setFilteredData([]);
                      setFileName('');
                      setColumns([]);
                      setProceedToDashboard(false);
                    }}
                  >
                    Upload
                  </Button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Button variant="outline" size="icon" onClick={handleUndoFilter} disabled={!filterUndoStack.length} aria-label="Undo filter"><Undo2 /></Button>
                  <Button variant="outline" size="icon" onClick={handleRedoFilter} disabled={!filterRedoStack.length} aria-label="Redo filter"><Redo2 /></Button>
                  <Button variant="outline" size="icon" onClick={handleUndoChart} disabled={!chartUndoStack.length} aria-label="Undo chart"><Undo2 /></Button>
                  <Button variant="outline" size="icon" onClick={handleRedoChart} disabled={!chartRedoStack.length} aria-label="Redo chart"><Redo2 /></Button>
                </div>
                <div>
                  <DataFilter 
                    data={originalData} 
                    columns={columns} 
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
            {/* Data Visualization - full width below KPIs */}
            <div className="w-full mt-4 sm:mt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Data Visualization</h3>
                <Badge variant="secondary" className="text-xs">Interactive Charts</Badge>
              </div>
              <div className="min-h-[250px] sm:min-h-[350px] overflow-x-auto">
                <DataVisualization data={filteredData} columns={columns} />
              </div>
            </div>
            {/* Main Dashboard Row (Statistical Summary and AI Assistant) */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-0 items-stretch h-full">
              {/* Center - Summary */}
              <div className="flex-1 flex flex-col gap-4 sm:gap-6 h-full min-w-0">
                <div className="flex-1 flex flex-col">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-4">Statistical Summary</h3>
                  <div className="flex-1 overflow-x-auto">
                    <DataSummary data={filteredData} columns={columns} />
                  </div>
                </div>
              </div>
              {/* Right Sidebar - AI Assistant */}
              <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col h-full min-h-0 mt-4 lg:mt-0">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">AI Assistant</h3>
                  <Badge variant="default" className="text-xs bg-gradient-primary">Powered by Gemini</Badge>
                </div>
                <div className="flex-1 h-full min-h-0 overflow-auto">
                  <ChatInterface data={filteredData} dataColumns={columns} />
                </div>
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
