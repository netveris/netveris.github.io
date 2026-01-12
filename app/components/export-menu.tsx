import { Download, FileJson, FileText, Copy } from 'lucide-react';
import { Button } from './ui/button/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu/dropdown-menu';
import { exportAsJSON, exportAsText, copyToClipboard, type ExportData } from '~/utils/export';
import { useToast } from '~/hooks/use-toast';

interface ExportMenuProps {
  data: ExportData;
}

export function ExportMenu({ data }: ExportMenuProps) {
  const { toast } = useToast();

  const handleExportJSON = () => {
    exportAsJSON(data);
    toast({
      title: 'Exported as JSON',
      description: 'Report downloaded successfully',
    });
  };

  const handleExportText = () => {
    exportAsText(data);
    toast({
      title: 'Exported as Text',
      description: 'Report downloaded successfully',
    });
  };

  const handleCopy = async () => {
    try {
      const text = JSON.stringify(data, null, 2);
      await copyToClipboard(text);
      toast({
        title: 'Copied to Clipboard',
        description: 'Report copied successfully',
      });
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download size={16} />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson size={16} />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportText}>
          <FileText size={16} />
          Export as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy size={16} />
          Copy to Clipboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
