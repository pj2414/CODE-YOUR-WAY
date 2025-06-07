import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import CodeEditor from '@/components/editor/CodeEditor';
import AIChatbot from '@/components/chatbot/AIChatbot';
import DiscussionPanel from '@/components/discussions/DiscussionPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import type { Problem, SubmissionResult, TestCase } from '@/types/api';

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<SubmissionResult | null>(null);

  const { data: problem, isLoading } = useQuery({
    queryKey: ['problem', id],
    queryFn: () => api.getProblem(id!) as Promise<Problem>,
    enabled: !!id,
  });

  console.log('Fetched problem data:', problem); // Add this line

  useEffect(() => {
    if (problem) {
      console.log('Problem data in component:', problem);
    }
  }, [problem]);

  const submitMutation = useMutation({
    mutationFn: (data: { problemId: string; code: string; language: string }) =>
      api.submitCode(data.problemId, data.code, data.language),
    onSuccess: (data: any) => {
      setLastSubmissionResult(data.result);
      if (data.result.passed) {
        toast.success('All test cases passed! 🎉');
      } else {
        toast.error('Some test cases failed. Check the results below.');
      }
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Submission failed');
    },
  });

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
    const templates: Record<string, string> = {
      javascript: '// Write your solution here\nfunction solution() {\n    \n}',
      python: '# Write your solution here\ndef solution():\n    pass',
      java: 'public class Solution {\n    public void solution() {\n        \n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}',
      c: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}',
      go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n}',
    };
    setCode(templates[newLanguage] || '');
  }, []);

  const handleRun = useCallback(() => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }
    
    if (!problem?.testCases?.length) {
      toast.error('No test cases available');
      return;
    }

    // Make an API call to evaluate the code
    api.submitCode(id!, code, language)
      .then(response => {
        setLastSubmissionResult(response.result);
        if (response.result.passed) {
          toast.success('All test cases passed! 🎉');
        } else {
          toast.error('Some test cases failed. Check the results below.');
        }
      })
      .catch(error => {
        toast.error(error.message || 'Failed to run code');
      });

  }, [code, problem?.testCases, id, language]);

  const handleSubmit = useCallback(() => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }
    if (!id) return;
    
    submitMutation.mutate({
      problemId: id,
      code,
      language,
    });
  }, [code, language, id, submitMutation]);

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'difficulty-easy';
      case 'medium':
        return 'difficulty-medium';
      case 'hard':
        return 'difficulty-hard';
      default:
        return 'difficulty-easy';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Problem not found</h1>
          <Button onClick={() => navigate('/problems')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Problems
          </Button>
        </div>
      </div>
    );
  }

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Hard':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'min-h-screen'} flex flex-col`}>
      {/* Header */}
      {!isFullscreen && (
        <div className="border-b border-white/10 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/problems')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Problems</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-bold">{problem.title}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={getDifficultyVariant(problem.difficulty)}>
                    {problem.difficulty}
                  </Badge>
                  <Badge variant="outline">{problem.topicTag}</Badge>
                  {problem.topics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Problem Description Panel */}
        {!isFullscreen && (
          <div className="w-1/2 border-r border-white/10 overflow-hidden">
            <Tabs defaultValue="description" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 glass border-b border-white/10">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="discussions">Discuss</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="flex-1 overflow-auto p-6">
                <div className="space-y-6">
                  {problem.problemStatement && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold mb-3">Problem Statement</h3>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {problem.problemStatement}
                        </p>
                      </div>
                    </div>
                  )}

                  {problem.examples && problem.examples.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Examples</h3>
                      <div className="space-y-4">
                        {problem.examples.map((example, index) => (
                          <Card key={index} className="glass border border-white/10">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">Example {index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Input:
                                </span>
                                <div className="mt-1 bg-muted/20 rounded p-2 font-mono text-sm">
                                  {example.input}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Output:
                                </span>
                                <div className="mt-1 bg-muted/20 rounded p-2 font-mono text-sm">
                                  {example.output}
                                </div>
                              </div>
                              {example.explanation && (
                                <div>
                                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Explanation:
                                  </span>
                                  <div className="mt-1 text-sm text-muted-foreground">
                                    {example.explanation}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {problem.constraints && problem.constraints.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Constraints</h3>
                      <div className="glass rounded-lg p-4">
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {problem.constraints.map((constraint, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{constraint}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {problem.hint && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Hint
                      </h3>
                      <div className="glass rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">{problem.hint}</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="discussions" className="flex-1 overflow-auto p-6">
                <DiscussionPanel problemId={id!} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Code Editor Panel */}
        <div className={`${isFullscreen ? 'w-full' : 'w-1/2'} flex flex-col`}>
          <div className="flex-1">
            <CodeEditor
              language={language}
              value={code}
              onChange={setCode}
              onLanguageChange={handleLanguageChange}
              onRun={handleRun}
              onSubmit={handleSubmit}
              isRunning={false}
              isSubmitting={submitMutation.isPending}
              isFullscreen={isFullscreen}
              onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
            />
          </div>

          {/* Results Panel */}
          {lastSubmissionResult && (
            <div className="border-t border-white/10 max-h-64 overflow-auto">
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  {lastSubmissionResult.passed ? (
                    <CheckCircle className="h-5 w-5 text-neon-green" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <h3 className="font-semibold">
                    {lastSubmissionResult.passed ? 'All Tests Passed!' : 'Some Tests Failed'}
                  </h3>
                </div>

                {lastSubmissionResult.error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium">Error</span>
                    </div>
                    <code className="text-sm">{lastSubmissionResult.error}</code>
                  </div>
                )}

                <div className="space-y-2">
                  {lastSubmissionResult.testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.pass
                          ? 'bg-neon-green/10 border-neon-green/20'
                          : 'bg-destructive/10 border-destructive/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Test Case {index + 1}</span>
                        {result.pass ? (
                          <CheckCircle className="h-4 w-4 text-neon-green" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Input:</span>
                          <div className="font-mono mt-1 p-1 bg-muted/20 rounded">
                            {result.input}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Expected:</span>
                          <div className="font-mono mt-1 p-1 bg-muted/20 rounded">
                            {result.expected}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Your Output:</span>
                          <div className="font-mono mt-1 p-1 bg-muted/20 rounded">
                            {result.output || 'No output'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Chatbot */}
      {id && (
        <AIChatbot problemId={id} problemTitle={problem.title} />
      )}
    </div>
  );
};

export default ProblemDetail;
