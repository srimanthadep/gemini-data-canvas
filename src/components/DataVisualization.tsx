import { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartCustomization } from './ChartCustomization';

interface DataVisualizationProps {
  data: any[];
  columns: string[];
}

const COLOR_THEMES = {
  primary: ['hsl(var(--primary))', 'hsl(var(--primary-glow))', 'hsl(var(--accent))'],
  gradient: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))'],
  professional: ['hsl(var(--muted-foreground))', 'hsl(var(--primary))', 'hsl(var(--accent))'],
  vibrant: ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))']
};

export function DataVisualization({ data, columns }: DataVisualizationProps) {
  const [chartType, setChartType] = useState('bar');
  const [colorTheme, setColorTheme] = useState('primary');
  const [chartSize, setChartSize] = useState(400);
  const [selectedXAxis, setSelectedXAxis] = useState('');
  const [selectedYAxis, setSelectedYAxis] = useState('');
  const analysis = useMemo(() => {
    if (!data.length) return null;

    const numericColumns = columns.filter(col => 
      typeof data[0][col] === 'number'
    );
    
    const categoricalColumns = columns.filter(col => 
      typeof data[0][col] === 'string'
    );

    // Set default axes if not selected
    const xAxis = selectedXAxis || categoricalColumns[0] || columns[0];
    const yAxis = selectedYAxis || numericColumns[0] || columns[1];

    // Custom data preparation based on selected axes
    const customData = chartType === 'pie' ? 
      Object.entries(
        data.reduce((acc, row) => {
          const key = row[xAxis];
          acc[key] = (acc[key] || 0) + (typeof row[yAxis] === 'number' ? row[yAxis] : 1);
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value })).slice(0, 10) :
      data.slice(0, 50).map((row, index) => ({
        [xAxis]: row[xAxis],
        [yAxis]: typeof row[yAxis] === 'number' ? row[yAxis] : index,
        ...row
      }));

    return {
      numericColumns,
      categoricalColumns,
      customData,
      xAxis,
      yAxis
    };
  }, [data, columns, selectedXAxis, selectedYAxis, chartType]);

  const currentColors = COLOR_THEMES[colorTheme as keyof typeof COLOR_THEMES];

  const handleExportChart = (format: string) => {
    // This would implement chart export functionality
    console.log(`Exporting chart as ${format}`);
    // For now, just log - would need a library like html2canvas or jsPDF
  };

  if (!analysis || !data.length) {
    return (
      <Card className="p-8 bg-gradient-card border-border/50 shadow-card">
        <div className="text-center text-muted-foreground">
          <p>Upload a dataset to see visualizations</p>
        </div>
      </Card>
    );
  }

  const renderChart = () => {
    const chartProps = {
      data: analysis.customData,
      width: "100%",
      height: chartSize
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart data={analysis.customData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={analysis.xAxis}
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
                dataKey={analysis.yAxis}
                fill={currentColors[0]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...chartProps}>
            <LineChart data={analysis.customData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={analysis.xAxis}
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
              <Line
                type="monotone"
                dataKey={analysis.yAxis}
                stroke={currentColors[0]}
                strokeWidth={3}
                dot={{ r: 6, fill: currentColors[0] }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...chartProps}>
            <AreaChart data={analysis.customData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={analysis.xAxis}
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
              <Area
                type="monotone"
                dataKey={analysis.yAxis}
                stroke={currentColors[0]}
                fill={currentColors[0]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...chartProps}>
            <PieChart>
              <Pie
                data={analysis.customData}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(chartSize * 0.3, 150)}
                fill={currentColors[0]}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analysis.customData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} />
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
        );

      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <div className="space-y-6">
      <ChartCustomization
        chartType={chartType}
        onChartTypeChange={setChartType}
        colorTheme={colorTheme}
        onColorThemeChange={setColorTheme}
        chartSize={chartSize}
        onChartSizeChange={setChartSize}
        columns={columns}
        selectedXAxis={selectedXAxis}
        selectedYAxis={selectedYAxis}
        onXAxisChange={setSelectedXAxis}
        onYAxisChange={setSelectedYAxis}
        onExportChart={handleExportChart}
      />

      <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Interactive Chart</h2>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{data.length} rows</Badge>
              <Badge variant="secondary">{columns.length} columns</Badge>
              <Badge variant="outline">
                {analysis.xAxis} × {analysis.yAxis}
              </Badge>
            </div>
          </div>
        </div>

        <div className="w-full">
          {renderChart()}
        </div>
      </Card>
    </div>
  );
}