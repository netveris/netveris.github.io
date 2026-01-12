import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert/alert';

interface EducationalTipProps {
  title: string;
  children: React.ReactNode;
}

export function EducationalTip({ title, children }: EducationalTipProps) {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
