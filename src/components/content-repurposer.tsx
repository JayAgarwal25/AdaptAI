'use client';
import { Trash2 } from 'lucide-react';

// Helper function to upload file to AssemblyAI and get upload_url
async function uploadToAssemblyAI(file: File, apiKey: string): Promise<string> {
  const res = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: { authorization: apiKey },
    body: file,
  });
  if (!res.ok) throw new Error('Failed to upload to AssemblyAI');
  const data = await res.json();
  return data.upload_url;
}

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
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  // TTS playback handler
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Map language names to Google Cloud TTS language codes
  const languageCodeMap: Record<string, string> = {
    English: 'en-IN',
    Hindi: 'hi-IN',
    Bengali: 'bn-IN',
    Tamil: 'ta-IN',
    Telugu: 'te-IN',
    Gujarati: 'gu-IN',
    Marathi: 'mr-IN',
    Kannada: 'kn-IN',
    Malayalam: 'ml-IN',
    Punjabi: 'pa-IN',
    Urdu: 'ur-IN',
  };

  // Get selected language from props or context
  const selectedLanguage = typeof window !== 'undefined' ? (document.getElementById('language')?.getAttribute('data-state') || 'English') : 'English';

  // Simple markdown stripping function
  function stripMarkdown(md: string) {
    return md
      .replace(/([*_~`>#\-])/g, '') // Remove markdown symbols
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Remove links, keep text
      .replace(/!\[(.*?)\]\((.*?)\)/g, '') // Remove images
      .replace(/\n{2,}/g, '\n') // Collapse multiple newlines
      .replace(/\n/g, ' '); // Replace newlines with space
  }

  const playTTS = async (text: string, languageName: string = 'English') => {
    setTtsLoading(true);
    try {
      const languageCode = languageCodeMap[languageName] || 'en-IN';
      const plainText = stripMarkdown(text);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: plainText, languageCode }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new window.Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setTtsPlaying(false);
      audio.play();
      setTtsPlaying(true);
    } catch (err) {
      // Optionally show error toast
    }
    setTtsLoading(false);
  };
  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setTtsPlaying(false);
    }
  };
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
        // Group questions by type
        const grouped = quizArray.reduce((acc, item, idx) => {
          acc[item.type] = acc[item.type] || [];
          acc[item.type].push({ ...item, idx });
          return acc;
        }, {} as Record<string, Array<any>>);

        return (
          <div className="space-y-8">
            {Object.entries(grouped).map(([type, questions]) => (
              <div key={type}>
                <h3 className="font-bold text-lg mb-2 capitalize" style={{ textDecoration: 'none' }}>{type === 'mcq' ? 'Multiple Choice Questions' : type === 'brief' ? 'Brief Answer' : type === 'truefalse' ? 'True/False' : type === 'fillblank' ? 'Fill in the Blank' : type}</h3>
                <Accordion type="multiple" className="space-y-4">
                  {Array.isArray(questions) && questions.map((item) => (
                    <AccordionItem value={`item-${item.idx}`} key={item.idx}>
                      {(item.type === 'mcq' || item.type === 'truefalse') ? (
                        <div className="flex flex-col text-left p-4">
                          <span className="font-bold" style={{ textDecoration: 'none' }}>{item.question}</span>
                          {item.type === 'mcq' && item.options && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {item.options.map((opt: string, i: number) => {
                                const isSelected = selectedOptions[item.idx] === i;
                                const isCorrect = opt === item.answer;
                                const showResult = selectedOptions[item.idx] !== undefined;
                                return (
                                  <div
                                    key={i}
                                    className={`rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center border transition-all`}
                                    style={{ textDecoration: 'none',
                                      borderColor: isSelected ? '#9333ea' : (isCorrect && showResult ? '#16a34a' : ''),
                                      background: isCorrect && showResult ? 'linear-gradient(to right, #4ade80, #16a34a)' : '',
                                      color: isCorrect && showResult ? '#fff' : '',
                                    }}
                                    onClick={() => {
                                      if (selectedOptions[item.idx] === undefined) {
                                        setSelectedOptions(prev => ({ ...prev, [item.idx]: i }));
                                      }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isSelected}
                                  >
                                    <span style={{ textDecoration: 'none' }}>{opt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {item.type === 'truefalse' && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {['True', 'False'].map((opt, i) => {
                                const isSelected = selectedOptions[item.idx] === i;
                                const isCorrect = opt === item.answer;
                                const showResult = selectedOptions[item.idx] !== undefined;
                                return (
                                  <div
                                    key={i}
                                    className={`rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center border transition-all`}
                                    style={{ textDecoration: 'none',
                                      borderColor: isSelected ? '#9333ea' : (isCorrect && showResult ? '#16a34a' : ''),
                                      background: isCorrect && showResult ? 'linear-gradient(to right, #4ade80, #16a34a)' : '',
                                      color: isCorrect && showResult ? '#fff' : '',
                                    }}
                                    onClick={() => {
                                      if (selectedOptions[item.idx] === undefined) {
                                        setSelectedOptions(prev => ({ ...prev, [item.idx]: i }));
                                      }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isSelected}
                                  >
                                    <span style={{ textDecoration: 'none' }}>{opt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {selectedOptions[item.idx] !== undefined && item.explanation && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <span className="font-bold">Explanation:</span> {item.explanation}
                            </div>
                          )}
                        </div>
                      ) : (
                        <AccordionTrigger>
                          <div className="flex flex-col text-left">
                            <span className="font-bold" style={{ textDecoration: 'none' }}>{item.question}</span>
                          </div>
                        </AccordionTrigger>
                      )}
                      {item.type !== 'mcq' && item.type !== 'truefalse' && (
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
                      )}
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
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

  // TTS button logic for heading
  let ttsButton = null;
  if (result.success && result.data) {
    let ttsText = '';
    if (result.outputType === 'summary') ttsText = result.data.summary;
    if (result.outputType === 'notes') ttsText = result.data.notes;
    if (result.outputType === 'video') ttsText = result.data.summary;
    if (ttsText) {
      ttsButton = (
        <button
          className="ml-auto px-3 py-1 rounded bg-purple-600 text-white text-sm flex items-center gap-2 shadow hover:bg-purple-700 transition"
          disabled={ttsLoading}
          onClick={() => ttsPlaying ? stopTTS() : playTTS(ttsText, selectedLanguage)}
        >
          {ttsLoading ? 'Loading...' : ttsPlaying ? '⏹ Stop' : '🔊 Listen'}
        </button>
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 justify-between">
          <CardTitle className="flex items-center gap-2">
            <OutputIcon className="h-5 w-5" />
            Generated{' '}
            {outputOptions.find((o) => o.value === result.outputType)?.label}
          </CardTitle>
          {ttsButton}
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}

type ContentRepurposerProps = {
  setHistory: (value: HistoryItem[] | ((val: HistoryItem[]) => HistoryItem[])) => void;
};

export function ContentRepurposer({ setHistory }: ContentRepurposerProps) {
  const [extracting, setExtracting] = useState(false);
  const [extractionReady, setExtractionReady] = useState(false);
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
              <div className="relative">
                <Textarea
                  name="content"
                  placeholder="Start by pasting your content here..."
                  className="min-h-36"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  disabled={extracting}
                />
                {(extracting || extractionReady) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-muted" style={{borderRadius: '0.5rem', opacity: 1}}>
                    {extracting ? (
                      <>
                        <Loader2 className="animate-spin h-8 w-8 mb-2 text-purple-600" />
                        <span className="text-lg font-medium text-purple-600">Processing Data</span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-8 w-8 mb-2 text-purple-600" />
                        <span className="text-lg font-medium text-purple-600">Ready! You can now generate content.</span>
                        <div className="w-full flex justify-end">
                          <span
                            className="absolute right-0 bottom-[-2.5rem] text-white cursor-pointer text-sm font-medium flex items-center gap-1"
                            onClick={() => {
                              setContent('');
                              setExtracting(false);
                              setExtractionReady(false);
                            }}
                          >
                            <Trash2 className="w-4 h-4" /> Discard
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
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
                  setExtracting(true);
                  setExtractionReady(false);
                  // Show image preview
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const imgSrc = ev.target?.result as string;
                    // Extract text using Tesseract.js
                    const Tesseract = await import('tesseract.js');
                    const result = await Tesseract.recognize(file, 'eng');
                    setContent(result.data.text);
                    setExtracting(false);
                    setExtractionReady(true);
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
                  setExtracting(true);
                  setExtractionReady(false);
                  const { readFileAsText } = await import('@/lib/fileReader');
                  setContent(await readFileAsText(file));
                  setExtracting(false);
                  setExtractionReady(true);
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
                  setExtracting(true);
                  setExtractionReady(false);
                  try {
                    const apiKey = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY!;
                    const uploadUrl = await uploadToAssemblyAI(file, apiKey);
                    const res = await fetch('/api/transcribe-video', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ audio_url: uploadUrl }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setContent(data.transcript);
                      setExtracting(false);
                      setExtractionReady(true);
                    } else {
                      setContent('');
                      setExtracting(false);
                      setExtractionReady(false);
                      toast({
                        variant: 'destructive',
                        title: 'Transcription Error',
                        description: 'Could not transcribe media file. Try again.',
                      });
                    }
                  } catch (err: any) {
                    setExtracting(false);
                    setExtractionReady(false);
                    toast({
                      variant: 'destructive',
                      title: 'Upload Error',
                      description: err.message,
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
                  setExtracting(true);
                  setExtractionReady(false);
                  try {
                    const apiKey = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY!;
                    const uploadUrl = await uploadToAssemblyAI(file, apiKey);
                    const res = await fetch('/api/transcribe-video', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ audio_url: uploadUrl }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setContent(data.transcript);
                      setExtracting(false);
                      setExtractionReady(true);
                    } else {
                      setContent('');
                      setExtracting(false);
                      setExtractionReady(false);
                      toast({
                        variant: 'destructive',
                        title: 'Transcription Error',
                        description: 'Could not transcribe media file. Try again.',
                      });
                    }
                  } catch (err: any) {
                    setExtracting(false);
                    setExtractionReady(false);
                    toast({
                      variant: 'destructive',
                      title: 'Upload Error',
                      description: err.message,
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
                onClick={e => { e.preventDefault(); document.getElementById('upload-image')?.click(); }}
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Upload Document"
                onClick={e => { e.preventDefault(); document.getElementById('upload-document')?.click(); }}
              >
                <FileIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Upload Video"
                onClick={e => { e.preventDefault(); document.getElementById('upload-video')?.click(); }}
              >
                <Video className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Upload Audio"
                onClick={e => { e.preventDefault(); document.getElementById('upload-audio')?.click(); }}
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
                  <SelectItem value="Gujarati">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> Gujarati
                    </div>
                  </SelectItem>
                  <SelectItem value="Marathi">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> Marathi
                    </div>
                  </SelectItem>
                  <SelectItem value="Kannada">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> Kannada
                    </div>
                  </SelectItem>
                  <SelectItem value="Malayalam">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> Malayalam
                    </div>
                  </SelectItem>
                  <SelectItem value="Punjabi">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> Punjabi
                    </div>
                  </SelectItem>
                  <SelectItem value="Urdu">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> Urdu
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
