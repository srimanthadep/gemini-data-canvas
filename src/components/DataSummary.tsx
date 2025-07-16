import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Database, Hash, FileWarning } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface DataSummaryProps {
  data: any[];
  columns: string[];
  loading?: boolean;
}

export function DataSummary({ data, columns, loading = false }: DataSummaryProps) {
  const summary = useMemo(() => {
    if (!data.length) return null;

    const numericColumns = columns.filter(col => 
      typeof data[0][col] === 'number'
    );
    
    const categoricalColumns = columns.filter(col => 
      typeof data[0][col] === 'string'
    );

    // Calculate statistics for numeric columns
    const numericStats = numericColumns.reduce((acc, col) => {
      const values = data.map(row => row[col]).filter(val => typeof val === 'number');
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      acc[col] = { avg: avg.toFixed(2), min, max, sum };
      return acc;
    }, {} as Record<string, any>);

    // Count unique values in categorical columns
    const categoricalStats = categoricalColumns.reduce((acc, col) => {
      const uniqueValues = new Set(data.map(row => row[col]));
      acc[col] = uniqueValues.size;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRows: data.length,
      totalColumns: columns.length,
      numericColumns: numericColumns.length,
      categoricalColumns: categoricalColumns.length,
      numericStats,
      categoricalStats
    };
  }, [data, columns]);

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {Array.from({ length: 2 }).map((_, idx) => (
            <Card key={idx} className="p-6 bg-gradient-card border-border/50 shadow-card flex-1 w-full flex-grow">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div className="text-center" key={i}>
                    <Skeleton className="w-8 h-8 mx-auto mb-2 rounded-full" />
                    <Skeleton className="h-6 w-16 mx-auto mb-1" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-6 bg-gradient-card border-border/50 shadow-card w-full flex-1 flex-grow">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border border-border/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-16" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <FileWarning className="w-12 h-12 mb-4 text-warning" />
          <p className="text-lg font-semibold mb-2">No summary available</p>
          <p className="text-sm">Upload a dataset to see summary statistics here.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Overview and Categorical side by side */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <Card className="p-6 bg-gradient-card border-border/50 shadow-card flex-1 w-full flex-grow">
          <h2 className="text-2xl font-bold text-foreground mb-4">Dataset Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Database className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{summary.totalRows}</div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{summary.totalColumns}</div>
              <div className="text-sm text-muted-foreground">Total Columns</div>
            </div>
            <div className="text-center">
              <Hash className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{summary.numericColumns}</div>
              <div className="text-sm text-muted-foreground">Numeric Columns</div>
            </div>
            <div className="text-center">
              <PieChart className="w-8 h-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{summary.categoricalColumns}</div>
              <div className="text-sm text-muted-foreground">Categorical Columns</div>
            </div>
          </div>
        </Card>
        {Object.keys(summary.categoricalStats).length > 0 && (
          <Card className="p-6 bg-gradient-card border-border/50 shadow-card flex-1 w-full flex-grow">
            <h3 className="text-xl font-semibold text-foreground mb-4">Categorical Column Statistics</h3>
            <div className="grid gap-4">
              {Object.entries(summary.categoricalStats).map(([column, uniqueCount]) => (
                <div key={column} className="flex items-center justify-between border border-border/30 rounded-lg p-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{column}</h4>
                    <div className="text-sm text-muted-foreground">Categorical Column</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{uniqueCount}</div>
                    <div className="text-sm text-muted-foreground">Unique Values</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
      {/* Numeric stats: ensure this is outside the flex row and takes full width */}
      {/* Numeric Column Statistics Card (modern, focused design, vertical stack) */}
      <Card className="p-6 bg-gradient-card border-border/50 shadow-card flex flex-col items-center text-center">
        <BarChart3 className="w-10 h-10 text-accent mb-2" />
        <h2 className="text-xl font-bold text-foreground mb-4">Numeric Column Statistics</h2>
        <div className="flex flex-col gap-4 w-full max-h-96 overflow-y-auto pr-2 numeric-scrollbar">
          {Object.entries(summary.numericStats).length === 0 ? (
            <span className="text-muted-foreground text-sm">No numeric columns</span>
          ) : (
            Object.entries(summary.numericStats).map(([column, stats]: [string, any]) => (
              <div key={column} className="mb-2 bg-background rounded-xl shadow-card p-4 flex flex-col gap-2 border border-border/30">
                <div className="font-semibold text-foreground mb-1 text-lg">{column}</div>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20V4m0 0l-4 4m4-4l4 4" /></svg>
                    Avg: {stats.avg}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    Min: {stats.min}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    Max: {stats.max}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/10 text-muted-foreground text-xs font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                    Sum: {stats.sum.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      {/* Custom scrollbar styles for .numeric-scrollbar are defined in src/index.css */}
    </div>
  );
}