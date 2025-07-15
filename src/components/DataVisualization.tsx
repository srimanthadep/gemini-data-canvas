import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface DataVisualizationProps {
  data: any[];
  columns: string[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--primary-glow))'
];

export function DataVisualization({ data, columns }: DataVisualizationProps) {
  const analysis = useMemo(() => {
    if (!data.length) return null;

    const numericColumns = columns.filter(col => 
      typeof data[0][col] === 'number'
    );
    
    const categoricalColumns = columns.filter(col => 
      typeof data[0][col] === 'string'
    );

    // For bar chart - aggregate categorical data
    const categoricalData = categoricalColumns.length > 0 ? 
      Object.entries(
        data.reduce((acc, row) => {
          const key = row[categoricalColumns[0]];
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value })).slice(0, 10) : [];

    // For pie chart - top categories
    const pieData = categoricalData.slice(0, 6);

    // For line chart - if we have sequential data
    const lineData = numericColumns.length >= 2 ? 
      data.slice(0, 20).map((row, index) => ({
        index: index + 1,
        ...numericColumns.reduce((acc, col) => {
          acc[col] = row[col];
          return acc;
        }, {} as any)
      })) : [];

    return {
      numericColumns,
      categoricalColumns,
      categoricalData,
      pieData,
      lineData
    };
  }, [data, columns]);

  if (!analysis || !data.length) {
    return (
      <Card className="p-8 bg-gradient-card border-border/50 shadow-card">
        <div className="text-center text-muted-foreground">
          <p>Upload a dataset to see visualizations</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Data Visualizations</h2>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">{data.length} rows</Badge>
          <Badge variant="secondary">{columns.length} columns</Badge>
          <Badge variant="outline">{analysis.numericColumns.length} numeric</Badge>
          <Badge variant="outline">{analysis.categoricalColumns.length} categorical</Badge>
        </div>
      </div>

      <Tabs defaultValue="bar" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          <TabsTrigger value="pie">Pie Chart</TabsTrigger>
          <TabsTrigger value="line" disabled={analysis.numericColumns.length < 2}>
            Line Chart
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bar" className="space-y-4">
          <div className="h-[400px]">
            {analysis.categoricalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.categoricalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No categorical data available for bar chart
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pie" className="space-y-4">
          <div className="h-[400px]">
            {analysis.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysis.pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analysis.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No categorical data available for pie chart
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="line" className="space-y-4">
          <div className="h-[400px]">
            {analysis.lineData.length > 0 && analysis.numericColumns.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysis.lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="index" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  {analysis.numericColumns.slice(0, 3).map((col, index) => (
                    <Line
                      key={col}
                      type="monotone"
                      dataKey={col}
                      stroke={COLORS[index]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Need at least 2 numeric columns for line chart
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}