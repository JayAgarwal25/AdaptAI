'use client';
import 'katex/dist/katex.min.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ReactMarkdown from 'react-markdown';

import { useEffect, useState, useRef, useActionState } from 'react';
import { MathRenderer } from './MathRenderer';
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
  Music,
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
      case 'quiz': {
        let quizArray: any[] = [];
        try {
          quizArray = JSON.parse(result.data?.quiz || '[]');
        } catch {
          return <p>Could not parse quiz output.</p>;
        }
        if (!quizArray.length) {
          return <p className="text-muted-foreground">No quiz output was generated. Please check your input or try again later.</p>;
        }
        return (
          <Accordion type="multiple" className="space-y-4">
            {quizArray.map((item, idx) => (
              <AccordionItem value={`item-${idx}`} key={idx}>
                <AccordionTrigger>
                  <div className="flex flex-col text-left">
                    <span className="font-bold">
                      {item.type === 'mcq' && 'MCQ'}
                      {item.type === 'brief' && 'Brief Answer'}
                      {item.type === 'truefalse' && 'True/False'}
                      {item.type === 'fillblank' && 'Fill in the Blank'}
                    </span>
                    <span>{item.question}</span>
                    {item.type === 'mcq' && item.options && (
                      <ul className="mb-2 list-disc pl-5">
                        {item.options.map((opt: string, i: number) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-2">
                    <span className="font-bold">Answer:</span> {item.answer}
                  </div>
                  {item.explanation && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="font-bold">Explanation:</span> {item.explanation}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        );
      }
      case 'summary':
        return (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {result.data?.summary || ''}
            </ReactMarkdown>
          </div>
        );
      case 'notes':
        return (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {result.data?.notes || ''}
            </ReactMarkdown>
          </div>
        );
      case 'video':
        return (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {result.data?.summary || ''}
            </ReactMarkdown>
          </div>
        );
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

type ContentRepurposerProps = {
  setHistory: (value: HistoryItem[] | ((val: HistoryItem[]) => HistoryItem[])) => void;
};

export function ContentRepurposer({ setHistory }: ContentRepurposerProps) {
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const [state, formAction] = useActionState(repurposeContent, initialState);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [outputType, setOutputType] = useState<OutputType>('summary');
  const [history] = useLocalStorage<HistoryItem[]>('adapt-ai-history', []);
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('English');
  const [currentResult, setCurrentResult] = useState<RepurposeResult | null>(null);

  const processedHistoryIdRef = useRef<string | null>(null);
  useEffect(() => {
    const historyId = searchParams?.get('historyId');
    if (historyId && processedHistoryIdRef.current !== historyId) {
      const item = history.find((h) => h.id === historyId);
      if (item) {
        setContent(item.input.content);
        setOutputType(item.input.outputType);
        setLanguage(item.input.language);
        setCurrentResult(item.output);
        processedHistoryIdRef.current = historyId;
        setTimeout(() => {
          router.replace('/', { scroll: false });
        }, 0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, history]);

  useEffect(() => {
    if (state.success && state.data) {
      setCurrentResult({ ...state, outputType });
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        input: {
          content,
          outputType,
          language,
        },
        output: { ...state, outputType },
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
      toast({
        title: 'Content Adapted!',
        description: 'Your new content is ready.',
      });
    } else if (state.error) {
      setCurrentResult({ ...state, outputType });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Scroll to top of main content container when currentResult changes
  useEffect(() => {
    if (currentResult && contentContainerRef.current) {
      contentContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentResult]);

  return (
  <div className="space-y-8" ref={contentContainerRef}>
      <form action={formAction} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Content</CardTitle>
            <CardDescription>
              Paste your text, document, or script below, or upload a file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hidden inputs to ensure React state is submitted */}
            <input type="hidden" name="outputType" value={outputType} />
            <input type="hidden" name="language" value={language} />
            <div>
              <Textarea
                name="content"
                placeholder="Start by pasting your content here..."
                className="min-h-36"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            {/* Image preview and file inputs */}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-image"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file) {
                  // Show image preview
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const imgSrc = ev.target?.result as string;
                    // Extract text using Tesseract.js
                    const Tesseract = await import('tesseract.js');
                    const result = await Tesseract.recognize(file, 'eng');
                    setContent(result.data.text);
                    // Optionally show preview (can be styled as needed)
                    const preview = document.getElementById('image-preview');
                    if (preview) {
                      preview.innerHTML = `<img src='${imgSrc}' alt='preview' style='max-width:80px;max-height:80px;border-radius:8px;margin-bottom:4px;' />`;
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
              id="upload-document"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file) {
                  const { readFileAsText } = await import('@/lib/fileReader');
                  setContent(await readFileAsText(file));
                }
              }}
            />
            <input
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              id="upload-video"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file) {
                  const formData = new FormData();
                  formData.append('video', file);
                  const res = await fetch('/api/transcribe-video', {
                    method: 'POST',
                    body: formData,
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setContent(data.transcript);
                  } else {
                    setContent('');
                    toast({
                      variant: 'destructive',
                      title: 'Transcription Error',
                      description: 'Could not transcribe media file. Try again.',
                    });
                  }
                }
              }}
            />
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.m4a"
              style={{ display: 'none' }}
              id="upload-audio"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file) {
                  const formData = new FormData();
                  formData.append('video', file);
                  const res = await fetch('/api/transcribe-video', {
                    method: 'POST',
                    body: formData,
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setContent(data.transcript);
                  } else {
                    setContent('');
                    toast({
                      variant: 'destructive',
                      title: 'Transcription Error',
                      description: 'Could not transcribe media file. Try again.',
                    });
                  }
                }
              }}
            />
            <div className="flex gap-2 items-end mt-2">
              <span id="image-preview"></span>
              <button
                type="button"
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Upload Image"
                onClick={() => document.getElementById('upload-image')?.click()}
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Upload Document"
                onClick={() => document.getElementById('upload-document')?.click()}
              >
                <FileIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Upload Video"
                onClick={() => document.getElementById('upload-video')?.click()}
              >
                <Video className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Upload Audio"
                onClick={() => document.getElementById('upload-audio')?.click()}
              >
                <Music className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="grid gap-2 flex-1 w-full">
              <Label htmlFor="outputType">Desired Output</Label>
              <Select
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
