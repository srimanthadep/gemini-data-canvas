import { useState, useCallback } from 'react';
import { Upload, File, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileUpload: (data: any[], fileName: string) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      let data: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        // Simple CSV parsing
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            const value = values[index] || '';
            // Auto-detect numeric values
            const numValue = parseFloat(value);
            row[header] = !isNaN(numValue) && value !== '' ? numValue : value;
          });
          return row;
        });
      }
      
      if (data.length > 0) {
        onFileUpload(data, file.name);
        setUploadedFile(file.name);
      }
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <Card className="p-8 bg-gradient-card border-border/50 shadow-card">
      <div
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-muted-foreground/30 hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        {uploadedFile ? (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-success mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">File Uploaded Successfully</h3>
              <p className="text-muted-foreground">{uploadedFile}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setUploadedFile(null);
                const input = document.getElementById('file-input') as HTMLInputElement;
                if (input) input.value = '';
              }}
            >
              Upload Another File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {isProcessing ? (
              <div className="space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground">Processing your data...</p>
              </div>
            ) : (
              <>
                <Upload className="w-16 h-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Upload Your Dataset
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                </div>
                <div className="space-y-3">
                  <Button 
                    variant="default"
                    className="bg-gradient-primary hover:opacity-90"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <File className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Supports CSV files up to 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        
        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </Card>
  );
}