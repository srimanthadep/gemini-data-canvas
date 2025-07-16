import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { FixedSizeList as List } from 'react-window';

interface DataPreviewTableProps {
  data: any[];
  columns: string[];
  rowCount?: number;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ data, columns, rowCount = 10 }) => {
  const previewRows = data.slice(0, rowCount);
  const useVirtual = rowCount > 20;

  if (!data.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No data to preview. Please upload a dataset.</p>
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