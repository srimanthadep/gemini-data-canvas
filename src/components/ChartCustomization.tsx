import { useState } from 'react';
import { Settings, Palette, Download, Filter, BarChart, LineChart, PieChart as PieChartIcon, Grid3X3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ChartCustomizationProps {
  chartType: string;
  onChartTypeChange: (type: string) => void;
  colorTheme: string;
  onColorThemeChange: (theme: string) => void;
  chartSize: number;
  onChartSizeChange: (size: number) => void;
  columns: string[];
  selectedXAxis: string;
  selectedYAxis: string;
  onXAxisChange: (column: string) => void;
  onYAxisChange: (column: string) => void;
  onExportChart: (format: string) => void;
}

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
  { value: 'area', label: 'Area Chart', icon: Grid3X3 }
];

const COLOR_THEMES = [
  { value: 'primary', label: 'Primary Blue', colors: ['hsl(var(--primary))', 'hsl(var(--primary-glow))', 'hsl(var(--accent))'] },
  { value: 'gradient', label: 'Gradient Mix', colors: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))'] },
  { value: 'professional', label: 'Professional', colors: ['hsl(var(--muted-foreground))', 'hsl(var(--primary))', 'hsl(var(--accent))'] },
  { value: 'vibrant', label: 'Vibrant', colors: ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'] }
];

export function ChartCustomization({
  chartType,
  onChartTypeChange,
  colorTheme,
  onColorThemeChange,
  chartSize,
  onChartSizeChange,
  columns,
  selectedXAxis,
  selectedYAxis,
  onXAxisChange,
  onYAxisChange,
  onExportChart
}: ChartCustomizationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="p-4 bg-gradient-card border-border/50 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Chart Customization</h3>
        </div>
      </div>

      {isOpen && (
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
            Hide Controls
          </Button>
        </div>
      )}

      {isOpen && (
        <div className="mt-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {/* Chart Type */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Chart Type</label>
              <Select value={chartType} onValueChange={onChartTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                  <SelectItem value="pie">Pie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Color Theme */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Color Theme</label>
              <Select value={colorTheme} onValueChange={onColorThemeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select color theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Chart Size */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Chart Size</label>
              <Slider min={200} max={800} step={50} value={[chartSize]} onValueChange={([v]) => onChartSizeChange(v)} className="w-full" />
              <div className="text-xs text-muted-foreground mt-1">{chartSize}px</div>
            </div>
            {/* X Axis */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">X Axis</label>
              <Select value={selectedXAxis} onValueChange={onXAxisChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select X axis" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Y Axis */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Y Axis</label>
              <Select value={selectedYAxis} onValueChange={onYAxisChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Y axis" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Export Chart */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium mb-1 text-foreground">Export</label>
              <Button variant="outline" size="sm" onClick={() => onExportChart('png')}>Export PNG</Button>
              <Button variant="outline" size="sm" onClick={() => onExportChart('pdf')}>Export PDF</Button>
            </div>
          </div>
        </div>
      )}
      {!isOpen && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-muted rounded-lg shadow-card border border-border/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Chart:</span>
            <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium uppercase">{chartType}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Theme:</span>
            <span className="px-2 py-1 rounded bg-accent/10 text-accent text-xs font-medium uppercase">{colorTheme}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">X:</span>
            <span className="px-2 py-1 rounded bg-muted-foreground/10 text-muted-foreground text-xs font-medium">{selectedXAxis}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Y:</span>
            <span className="px-2 py-1 rounded bg-muted-foreground/10 text-muted-foreground text-xs font-medium">{selectedYAxis}</span>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setIsOpen(true)}>
            Show Controls
          </Button>
        </div>
      )}
    </Card>
  );
}