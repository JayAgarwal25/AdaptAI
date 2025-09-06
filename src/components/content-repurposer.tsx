'use client';

import { useEffect, useState, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  BrainCircuit,
  Languages,
  Loader2,
  FileText,
  List,
  HelpCircle,
  Video,
  Upload,
  Image as ImageIcon,
  File as FileIcon,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { repurposeContent, type RepurposeResult } from '@/app/actions';
import type { HistoryItem, OutputType } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const initialState: RepurposeResult = {
  success: false,
  outputType: 'summary',
};

const outputOptions: {
  value: OutputType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: 'summary', label: 'Summary', icon: FileText },
  { value: 'notes', label: 'Notes', icon: List },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
  { value: 'video', label: 'Video Script', icon: Video },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <BrainCircuit className="mr-2 h-4 w-4" />
      )}
      Adapt Content
    </Button>
  );
}

function OutputRenderer({ result }: { result: RepurposeResult }) {
  if (!result.success && !result.error) return null;

  if (result.error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">An Error Occurred</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{result.error}</p>
        </CardContent>
      </Card>
    );
  }

  const renderContent = () => {
    switch (result.outputType) {
      case 'quiz':
        const quizItems = result.data?.quiz
          .split(/(Q\d+:)/)
          .slice(1)
          .reduce((acc: string[][], part: string, i: number) => {
            if (i % 2 === 0) acc.push([part]);
            else acc[acc.length - 1].push(part);
            return acc;
          }, []);
        return (
          <Accordion type="single" collapsible className="w-full">
            {quizItems.map(([question, answer], index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{question.trim()}</AccordionTrigger>
                <AccordionContent>
                  <p className="whitespace-pre-wrap">{answer.trim()}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        );
      case 'summary':
      case 'notes':
      case 'video':
        return <p className="whitespace-pre-wrap">{result.data?.summary}</p>;
      default:
        return <p>Could not render the output.</p>;
    }
  };

  const OutputIcon =
    outputOptions.find((o) => o.value === result.outputType)?.icon || FileText;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <OutputIcon className="h-5 w-5" />
          Generated{' '}
          {outputOptions.find((o) => o.value === result.outputType)?.label}
        </CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}

export function ContentRepurposer() {
  const [state, formAction] = useActionState(repurposeContent, initialState);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [history, setHistory] = useLocalStorage<HistoryItem[]>('adapt-ai-history', []);
  const [content, setContent] = useState('');
  const [outputType, setOutputType] = useState<OutputType>('summary');
  const [language, setLanguage] = useState('English');
  const [currentResult, setCurrentResult] = useState<RepurposeResult | null>(null);

  useEffect(() => {
    const historyId = searchParams.get('historyId');
    if (historyId) {
      const item = history.find((h) => h.id === historyId);
      if (item) {
        setContent(item.input.content);
        setOutputType(item.input.outputType);
        setLanguage(item.input.language);
        setCurrentResult(item.output);
        // Clear the URL param to allow for new submissions
        router.replace('/', { scroll: false });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  useEffect(() => {
    if (state.success && state.data) {
      setCurrentResult(state);
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        input: {
          content: formRef.current?.querySelector<HTMLTextAreaElement>('[name="content"]')?.value || '',
          outputType: formRef.current?.querySelector<HTMLInputElement>('[name="outputType"]')?.value as OutputType || 'summary',
          language: formRef.current?.querySelector<HTMLInputElement>('[name="language"]')?.value || 'English',
        },
        output: state,
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
      toast({
        title: 'Content Adapted!',
        description: 'Your new content is ready.',
      });
    } else if (state.error) {
      setCurrentResult(state);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="space-y-8">
      <form ref={formRef} action={formAction} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Content</CardTitle>
            <CardDescription>
              Paste your text, document, or script below, or upload a file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              name="content"
              placeholder="Start by pasting your content here..."
              className="min-h-36"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline">
                <ImageIcon className="mr-2" /> Upload Image
              </Button>
              <Button type="button" variant="outline">
                <FileIcon className="mr-2" /> Upload Document
              </Button>
              <Button type="button" variant="outline">
                <Video className="mr-2" /> Upload Video
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="grid gap-2 flex-1 w-full">
              <Label htmlFor="outputType">Desired Output</Label>
              <Select
                name="outputType"
                value={outputType}
                onValueChange={(v) => setOutputType(v as OutputType)}
              >
                <SelectTrigger id="outputType">
                  <SelectValue placeholder="Select output format" />
                </SelectTrigger>
                <SelectContent>
                  {outputOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 flex-1 w-full">
              <Label htmlFor="language">Language</Label>
              <Select
                name="language"
                value={language}
                onValueChange={setLanguage}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> English
                    </div>
                  </SelectItem>
                  <SelectItem value="Hindi">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> Hindi
                    </div>
                  </SelectItem>
                  <SelectItem value="Bengali">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> Bengali
                    </div>
                  </SelectItem>
                  <SelectItem value="Tamil">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> Tamil
                    </div>
                  </SelectItem>
                  <SelectItem value="Telugu">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> Telugu
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-auto self-end">
              <SubmitButton />
            </div>
          </CardFooter>
        </Card>
      </form>

      {currentResult && <OutputRenderer result={currentResult} />}
    </div>
  );
}
