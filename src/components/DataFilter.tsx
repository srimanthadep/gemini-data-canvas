import { useState, useMemo } from 'react';
import { Filter, X, Search, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Filter {
  column: string;
  values: string[];
}

interface DataFilterProps {
  data: any[];
  columns: string[];
  onFilterChange: (filteredData: any[]) => void;
}

export function DataFilter({ data, columns, onFilterChange }: DataFilterProps) {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Get unique values for each column
  const columnValues = useMemo(() => {
    const values: Record<string, Set<string>> = {};
    
    columns.forEach(column => {
      values[column] = new Set();
      data.forEach(row => {
        const value = row[column];
        if (value !== null && value !== undefined) {
          values[column].add(String(value));
        }
      });
    });
    
    return values;
  }, [data, columns]);

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (filters.length === 0 && !searchTerm) return data;

    return data.filter(row => {
      // Apply column filters
      const passesFilters = filters.every(filter => {
        if (filter.values.length === 0) return true;
        const rowValue = String(row[filter.column]);
        return filter.values.includes(rowValue);
      });

      // Apply search term
      const passesSearch = !searchTerm || 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );

      return passesFilters && passesSearch;
    });
  }, [data, filters, searchTerm]);

  // Update parent component when filtered data changes
  useMemo(() => {
    onFilterChange(filteredData);
  }, [filteredData, onFilterChange]);

  const addFilter = (column: string, value: string) => {
    setFilters(prev => {
      const existingFilter = prev.find(f => f.column === column);
      if (existingFilter) {
        if (existingFilter.values.includes(value)) {
          // Remove value
          const newValues = existingFilter.values.filter(v => v !== value);
          if (newValues.length === 0) {
            return prev.filter(f => f.column !== column);
          }
          return prev.map(f => 
            f.column === column ? { ...f, values: newValues } : f
          );
        } else {
          // Add value
          return prev.map(f => 
            f.column === column ? { ...f, values: [...f.values, value] } : f
          );
        }
      } else {
        // Create new filter
        return [...prev, { column, values: [value] }];
      }
    });
  };

  const removeFilter = (column: string) => {
    setFilters(prev => prev.filter(f => f.column !== column));
  };

  const clearAllFilters = () => {
    setFilters([]);
    setSearchTerm('');
  };

  const isValueSelected = (column: string, value: string) => {
    const filter = filters.find(f => f.column === column);
    return filter?.values.includes(value) || false;
  };

  return (
    <Card className="p-4 bg-gradient-card border-border/50 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Data Filters</h3>
          {(filters.length > 0 || searchTerm) && (
            <Badge variant="secondary">
              {filteredData.length} / {data.length} rows
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(filters.length > 0 || searchTerm) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search across all data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active Filters */}
          {filters.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {filters.map(filter => (
                  <Badge
                    key={filter.column}
                    variant="default"
                    className="bg-primary/20 text-primary hover:bg-primary/30"
                  >
                    {filter.column}: {filter.values.length} selected
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => removeFilter(filter.column)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Column Filters */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Filter by Column:</h4>
            {columns.map(column => {
              const values = Array.from(columnValues[column] || []).sort();
              const selectedCount = filters.find(f => f.column === column)?.values.length || 0;
              
              return (
                <Collapsible key={column}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="flex items-center gap-2">
                        {column}
                        {selectedCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedCount}
                          </Badge>
                        )}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="max-h-48 overflow-y-auto space-y-2 p-2 border border-border/50 rounded-lg">
                      {values.slice(0, 50).map(value => (
                        <div key={value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${column}-${value}`}
                            checked={isValueSelected(column, value)}
                            onCheckedChange={() => addFilter(column, value)}
                          />
                          <label
                            htmlFor={`${column}-${value}`}
                            className="text-sm text-foreground cursor-pointer flex-1 truncate"
                            title={value}
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                      {values.length > 50 && (
                        <div className="text-xs text-muted-foreground text-center pt-2">
                          Showing first 50 of {values.length} values
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}