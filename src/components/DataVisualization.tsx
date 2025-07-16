import { useMemo, useState, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartCustomization } from './ChartCustomization';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Skeleton } from './ui/skeleton';
import { BarChart3, FileWarning } from 'lucide-react';

interface DataVisualizationProps {
  data: any[];
  columns: string[];
  loading?: boolean;
}

const COLOR_THEMES = {
  primary: ['hsl(var(--primary))', 'hsl(var(--primary-glow))', 'hsl(var(--accent))'],
  gradient: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))'],
  professional: ['hsl(var(--muted-foreground))', 'hsl(var(--primary))', 'hsl(var(--accent))'],
  vibrant: ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))']
};

export function DataVisualization({ data, columns, loading = false }: DataVisualizationProps) {
  const [chartType, setChartType] = useState('bar');
  const [colorTheme, setColorTheme] = useState('primary');
  const [chartSize, setChartSize] = useState(400);
  const [selectedXAxis, setSelectedXAxis] = useState('');
  const [selectedYAxis, setSelectedYAxis] = useState('');
  const [exporting, setExporting] = useState(false);
  const [chartTitle, setChartTitle] = useState('');
  const [xAxisLabel, setXAxisLabel] = useState('');
  const [yAxisLabel, setYAxisLabel] = useState('');
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
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExportChart = async (format: string) => {
    if (!chartRef.current) return;
    setExporting(true);
    try {
      // Temporarily set fixed size for export
      const chartDiv = chartRef.current;
      const prevWidth = chartDiv.style.width;
      const prevHeight = chartDiv.style.height;
      chartDiv.style.width = '800px';
      chartDiv.style.height = '400px';
      const canvas = await html2canvas(chartDiv, { backgroundColor: null, useCORS: true });
      chartDiv.style.width = prevWidth;
      chartDiv.style.height = prevHeight;
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `chart-export.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
        pdf.save('chart-export.pdf');
      }
    } catch (err) {
      alert('Failed to export chart. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 bg-gradient-card border-border/50 shadow-card">
        <div className="mb-4 flex flex-col gap-2">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-32 mb-2" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="bg-white rounded-lg p-4 flex items-center justify-center" style={{ width: 800, height: 400 }}>
          <Skeleton className="w-full h-72" />
        </div>
      </Card>
    );
  }

  if (!analysis || !data.length) {
    return (
      <Card className="p-8 bg-gradient-card border-border/50 shadow-card">
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mb-4 text-warning" />
          <p className="text-lg font-semibold mb-2">No data to visualize</p>
          <p className="text-sm">Upload a dataset to see visualizations here.</p>
        </div>
      </Card>
    );
  }

  const renderChart = (labels?: { xAxisLabel?: string; yAxisLabel?: string }) => {
    const chartProps = {
      data: analysis.customData,
      width: "100%",
      height: chartSize
    };
    const xLabel = labels?.xAxisLabel || analysis.xAxis;
    const yLabel = labels?.yAxisLabel || analysis.yAxis;
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
                label={{ value: xLabel, position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))', fontSize: 14 }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 14 }} />
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
                activeBar={{ fill: currentColors[0] }}
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
                label={{ value: xLabel, position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))', fontSize: 14 }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 14 }} />
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
                label={{ value: xLabel, position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))', fontSize: 14 }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 14 }} />
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
      <Card className="p-8 bg-gradient-card border-border/50 shadow-card">
        {/* Chart Title and Axis Labels Controls */}
        <div className="mb-4 flex flex-col gap-2">
          <input
            type="text"
            value={chartTitle}
            onChange={e => setChartTitle(e.target.value)}
            placeholder="Chart Title (e.g., Monthly Profit Report)"
            className="px-3 py-2 rounded border border-border/50 bg-background text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Chart title"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={xAxisLabel}
              onChange={e => setXAxisLabel(e.target.value)}
              placeholder="X Axis Label"
              className="px-2 py-1 rounded border border-border/50 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label="X axis label"
              style={{ minWidth: 120 }}
            />
            <input
              type="text"
              value={yAxisLabel}
              onChange={e => setYAxisLabel(e.target.value)}
              placeholder="Y Axis Label"
              className="px-2 py-1 rounded border border-border/50 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label="Y axis label"
              style={{ minWidth: 120 }}
            />
          </div>
        </div>
        {/* Chart Customization and Export Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">Export Chart</Badge>
            <button
              className="px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/80 transition"
              onClick={() => handleExportChart('png')}
              aria-label="Export chart as PNG"
              disabled={exporting}
            >{exporting ? 'Exporting...' : 'PNG'}</button>
            <button
              className="px-3 py-1 rounded bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/80 transition"
              onClick={() => handleExportChart('pdf')}
              aria-label="Export chart as PDF"
              disabled={exporting}
            >{exporting ? 'Exporting...' : 'PDF'}</button>
          </div>
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
        </div>
        {/* In the chart area, set the background to match the app background */}
        <div className="bg-background p-8 flex flex-col items-center justify-center min-h-[350px]">
          {chartTitle && (
            <div className="text-center text-lg font-bold mb-2 text-foreground">{chartTitle}</div>
          )}
          {renderChart({ xAxisLabel, yAxisLabel })}
        </div>
      </Card>
    </div>
  );
}