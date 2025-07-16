import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { FixedSizeList as List } from 'react-window';
import { Skeleton } from './ui/skeleton';
import { FileWarning } from 'lucide-react';

interface DataPreviewTableProps {
  data: any[];
  columns: string[];
  rowCount?: number;
  loading?: boolean;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ data, columns, rowCount = 10, loading = false }) => {
  const previewRows = data.slice(0, rowCount);
  const useVirtual = rowCount > 20;

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-border/50 bg-gradient-card shadow-card my-4">
        <Table aria-label="Data preview table loading skeleton">
          <TableHeader>
            <TableRow>
              {(columns.length ? columns : Array(5).fill('')).map((col, idx) => (
                <TableHead key={col || idx}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {(columns.length ? columns : Array(5).fill('')).map((col, colIdx) => (
                  <TableCell key={col || colIdx}>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="text-xs text-muted-foreground px-4 py-2">
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileWarning className="w-12 h-12 mb-4 text-warning" />
        <p className="text-lg font-semibold mb-2">No data to preview</p>
        <p className="text-sm">Please upload a dataset to see a preview here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 bg-gradient-card shadow-card my-4">
      <Table aria-label="Data preview table">
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {useVirtual ? (
            <List
              height={400}
              itemCount={previewRows.length}
              itemSize={40}
              width={columns.length * 160}
            >
              {({ index, style }) => (
                <TableRow key={index} style={style}>
                  {columns.map((col) => (
                    <TableCell key={col}>{previewRows[index][col]}</TableCell>
                  ))}
                </TableRow>
              )}
            </List>
          ) : (
            previewRows.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col}>{row[col]}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="text-xs text-muted-foreground px-4 py-2">
        Showing first {previewRows.length} of {data.length} rows
      </div>
    </div>
  );
}; 