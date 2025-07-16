import { useState, useCallback } from 'react';
import { Upload, File, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';
import { toast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onFileUpload: (data: any[], fileName: string) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      // Validate file type and size
      if (!file.name.endsWith('.csv')) {
        setError('Only CSV files are supported.');
        toast({ title: 'Upload Error', description: 'Only CSV files are supported.', variant: 'destructive' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        toast({ title: 'Upload Error', description: 'File size exceeds 10MB limit.', variant: 'destructive' });
        return;
      }
      const text = await file.text();
      // Use PapaParse for robust CSV parsing
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });
      if (result.errors.length > 0) {
        setError('Malformed CSV: ' + result.errors[0].message);
        toast({ title: 'Upload Error', description: 'Malformed CSV: ' + result.errors[0].message, variant: 'destructive' });
        return;
      }
      const data = result.data as any[];
      if (!data.length || Object.keys(data[0]).length === 0) {
        setError('CSV must have headers and at least one data row.');
        toast({ title: 'Upload Error', description: 'CSV must have headers and at least one data row.', variant: 'destructive' });
        return;
      }
      onFileUpload(data, file.name);
      setUploadedFile(file.name);
      toast({ title: 'File Uploaded', description: `${file.name} uploaded successfully.`, variant: 'default' });
    } catch (error) {
      setError('Error processing file. Please check your CSV and try again.');
      toast({ title: 'Upload Error', description: 'Error processing file. Please check your CSV and try again.', variant: 'destructive' });
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
        role="region"
        aria-label="File upload area. Drag and drop your CSV file here or click to browse."
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
                  {error && (
                    <div className="text-red-600 text-sm font-medium mb-2">{error}</div>
                  )}
                </div>
                <div className="space-y-3">
                  <Button 
                    variant="default"
                    className="bg-gradient-primary hover:opacity-90"
                    onClick={() => document.getElementById('file-input')?.click()}
                    aria-label="Choose file to upload"
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
          aria-label="CSV file input"
        />
      </div>
    </Card>
  );
}