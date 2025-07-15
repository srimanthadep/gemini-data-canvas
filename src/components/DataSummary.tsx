import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Database, Hash } from 'lucide-react';

interface DataSummaryProps {
  data: any[];
  columns: string[];
}

export function DataSummary({ data, columns }: DataSummaryProps) {
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

  if (!summary) {
    return (
      <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
        <div className="text-center text-muted-foreground">
          <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Upload a dataset to see summary statistics</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
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

      {Object.keys(summary.numericStats).length > 0 && (
        <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
          <h3 className="text-xl font-semibold text-foreground mb-4">Numeric Column Statistics</h3>
          <div className="grid gap-4">
            {Object.entries(summary.numericStats).map(([column, stats]: [string, any]) => (
              <div key={column} className="border border-border/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">{column}</h4>
                  <Badge variant="outline">Numeric</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Average</div>
                    <div className="font-medium text-foreground">{stats.avg}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Min
                    </div>
                    <div className="font-medium text-foreground">{stats.min}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Max
                    </div>
                    <div className="font-medium text-foreground">{stats.max}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Sum</div>
                    <div className="font-medium text-foreground">{stats.sum.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {Object.keys(summary.categoricalStats).length > 0 && (
        <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
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
  );
}