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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Hide' : 'Show'} Controls
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-6">
          {/* Chart Type Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Chart Type</label>
            <div className="grid grid-cols-2 gap-2">
              {CHART_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant={chartType === type.value ? "default" : "outline"}
                    className={`justify-start ${chartType === type.value ? 'bg-gradient-primary' : ''}`}
                    onClick={() => onChartTypeChange(type.value)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Data Mapping */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">X-Axis</label>
              <Select value={selectedXAxis} onValueChange={onXAxisChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Y-Axis</label>
              <Select value={selectedYAxis} onValueChange={onYAxisChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Color Theme */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Color Theme</label>
            <div className="space-y-2">
              {COLOR_THEMES.map((theme) => (
                <div
                  key={theme.value}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    colorTheme === theme.value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  onClick={() => onColorThemeChange(theme.value)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{theme.label}</span>
                    <div className="flex gap-1">
                      {theme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-border/30"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Chart Size */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Chart Height: {chartSize}px
            </label>
            <Slider
              value={[chartSize]}
              onValueChange={(value) => onChartSizeChange(value[0])}
              max={800}
              min={300}
              step={50}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Export Options */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Export Chart</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportChart('png')}
              >
                <Download className="w-4 h-4 mr-1" />
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportChart('svg')}
              >
                <Download className="w-4 h-4 mr-1" />
                SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportChart('pdf')}
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}