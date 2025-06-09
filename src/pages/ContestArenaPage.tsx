import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, Trophy, Code, Send } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';
import CodeEditor from '@/components/editor/CodeEditor';
import type { Contest, Problem } from '@/types/api';

// New interfaces for test results and problem attempts
interface TestResult {
  input: string;
  expected: string;
  output?: string;
  pass: boolean;
  error?: string;
}

interface ProblemAttempt {
  submitted: boolean;
  startTime?: Date;
  endTime?: Date;
  code?: string;
  result?: {
    passed: boolean;
    testResults: TestResult[];
  };
}

const ContestArenaPage = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [problemAttempts, setProblemAttempts] = useState<Record<string, ProblemAttempt>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<{
    passed: boolean;
    testResults: TestResult[];
    error?: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const { data: contest, isLoading, error } = useQuery({
    queryKey: ['contest', contestId],
    queryFn: () => api.getContest(contestId!),
    enabled: !!contestId,
    retry: 0,
    onError: (error: any) => {
      // Show toast and redirect if forbidden or not joined
      if (error.message?.includes('join the contest') || error.message?.includes('not started')) {
        toast({
          title: "Access Denied",
          description: error.message,
          variant: "destructive"
        });
        navigate('/contests');
      }
    }
  });

  useEffect(() => {
    if (contest && new Date() < new Date(contest.startTime)) {
      toast({
        title: "Contest Not Started",
        description: "This contest has not started yet. Please wait for the start time.",
        variant: "destructive"
      });
      navigate('/contests');
    }
  }, [contest, navigate, toast]);

  // Update countdown timer
  useEffect(() => {
    if (!contest) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(contest.endTime);
      const secondsLeft = differenceInSeconds(end, now);

      if (secondsLeft <= 0) {
        setTimeLeft('Contest ended');
        return;
      }

      const hours = Math.floor(secondsLeft / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  // Set first problem as selected when problems load
  useEffect(() => {
    if (contest?.problems && contest.problems.length > 0 && !selectedProblem) {
      setSelectedProblem(contest.problems[0]);
    }
  }, [contest, selectedProblem]);

  // Handle Run Code
  const handleRun = async () => {
    if (!selectedProblem || !code.trim()) {
      toast({ title: "Error", description: "Please write some code first" });
      return;
    }

    setIsRunning(true);
    setLastRunResult(null);
    
    try {
      const response = await api.runContestCode(
        contestId!, 
        selectedProblem._id, 
        code, 
        selectedLanguage
      );

      setLastRunResult(response.result);
      if (response.result.passed) {
        toast.success('All test cases passed! 🎉');
      } else if (response.result.error) {
        toast.error(response.result.error);
      } else {
        toast.warning('Some test cases failed. Check the results below.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  // Initialize problem attempts from contest data
  useEffect(() => {
    if (contest?.problems) {
      const initialAttempts: Record<string, ProblemAttempt> = {};
      contest.problems.forEach(problem => {
        const userSubmission = contest.userSubmissions?.find(
          sub => sub.problemId === problem._id
        );
        
        initialAttempts[problem._id] = {
          submitted: !!userSubmission,
          startTime: userSubmission?.submittedAt ? new Date(userSubmission.submittedAt) : undefined,
          endTime: userSubmission?.submittedAt ? new Date(userSubmission.submittedAt) : undefined,
          code: userSubmission?.code || '',
          result: userSubmission?.result
        };
      });
      setProblemAttempts(initialAttempts);
    }
  }, [contest]);

  // Add the submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProblem || !code.trim()) {
        throw new Error('Please write some code first');
      }

      return api.submitContestCode(
        contestId!, 
        selectedProblem._id, 
        code,
        selectedLanguage
      );
    },
    onSuccess: (response) => {
      setProblemAttempts(prev => ({
        ...prev,
        [selectedProblem!._id]: {
          submitted: true,
          code,
          result: response.result,
          endTime: new Date(),
          startTime: prev[selectedProblem!._id]?.startTime || new Date()
        }
      }));

      if (response.result?.passed) {
        toast({
          title: "Success",
          description: "Solution submitted successfully! 🎉",
        });
      } else {
        toast({
          title: "Submitted",
          description: "Solution submitted but some test cases failed.",
          variant: "destructive"
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['contest', contestId] });
    },
    onError: (error: any) => {
      if (error.message?.includes('already submitted')) {
        toast({
          title: "Error",
          description: "You have already submitted a solution for this problem",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || 'Failed to submit code',
          variant: "destructive"
        });
      }
    }
  });

  // Handle Submit Code
  const handleSubmit = async () => {
    if (!selectedProblem || !code.trim()) {
      toast({ 
        title: "Error", 
        description: "Please write some code first",
        variant: "destructive"
      });
      return;
    }

    const currentAttempt = problemAttempts[selectedProblem._id];
    if (currentAttempt?.submitted) {
      toast({ 
        title: "Error", 
        description: "You have already submitted a solution for this problem",
        variant: "destructive"
      });
      return;
    }

    submitMutation.mutate();
  };

  // Start timer when selecting a new problem
  useEffect(() => {
    if (selectedProblem && !problemAttempts[selectedProblem._id]) {
      setProblemAttempts(prev => ({
        ...prev,
        [selectedProblem._id]: {
          submitted: false,
          startTime: new Date()
        }
      }));
    }
  }, [selectedProblem]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground">Please log in to access the contest.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading contest</h1>
          <p className="text-muted-foreground">You may not be registered for this contest or it may not exist.</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Contest not found</h1>
          <p className="text-muted-foreground">The contest you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header - Combined approach with enhanced design */}
        <Card className="glass border border-white/10 mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">{contest.title}</CardTitle>
                <p className="text-muted-foreground mt-2">{contest.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="font-mono bg-blue-500/10 border-blue-500/20 text-blue-400">
                  <Clock className="w-4 h-4 mr-2 text-neon-purple" />
                  {timeLeft}
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-400">
                  <Trophy className="w-4 h-4 mr-2" />
                  {contest.problems?.length || 0} Problems
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Problems List with enhanced design */}
          <div className="lg:col-span-4">
            <Card className="glass border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-neon-purple" />
                  <span>Contest Problems</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contest.problems?.map((problem, index) => (
                    <button
                      key={problem._id}
                      onClick={() => setSelectedProblem(problem)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                        selectedProblem?._id === problem._id
                          ? 'bg-neon-purple/20 border border-neon-purple/40 shadow-lg shadow-neon-purple/10'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {String.fromCharCode(65 + index)}. {problem.title}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${
                            problem.difficulty === 'Easy' ? 'difficulty-easy bg-green-500/20 text-green-400' :
                            problem.difficulty === 'Medium' ? 'difficulty-medium bg-yellow-500/20 text-yellow-400' :
                            'difficulty-hard bg-red-500/20 text-red-400'
                          }`}>
                            {problem.difficulty}
                          </Badge>
                          {problemAttempts[problem._id]?.submitted && (
                            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/40">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Problems Available</h3>
                      <p className="text-sm">Problems will appear here when the contest begins</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Problem Details & Editor */}
          <div className="lg:col-span-8 space-y-6">
            {selectedProblem ? (
              <>
                {/* Problem Statement - Enhanced with better formatting */}
                <Card className="glass border border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-xl">{selectedProblem.title}</span>
                      <Badge className={`${
                        selectedProblem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                        selectedProblem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                        'bg-red-500/20 text-red-400 border-red-500/40'
                      }`}>
                        {selectedProblem.difficulty}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Problem Description */}
                    <div>
                      <h4 className="font-semibold mb-3 text-lg">Problem Statement</h4>
                      <div className="prose prose-sm max-w-none text-muted-foreground bg-white/5 p-4 rounded-lg border border-white/10">
                        <div dangerouslySetInnerHTML={{ __html: selectedProblem.description }} />
                        {!selectedProblem.description.includes('<') && (
                          <p>{selectedProblem.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Input/Output Format */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        {/* <h4 className="font-semibold mb-2">Input Format</h4> */}
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                          <p className="text-muted-foreground text-sm">{selectedProblem.inputFormat}</p>
                        </div>
                      </div>
                      <div>
                        {/* <h4 className="font-semibold mb-2">Output Format</h4> */}
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                          <p className="text-muted-foreground text-sm">{selectedProblem.outputFormat}</p>
                        </div>
                      </div>
                    </div>

                    {/* Examples */}
                    {selectedProblem.examples && selectedProblem.examples.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Examples</h4>
                        <div className="space-y-4">
                          {selectedProblem.examples.map((example, index) => (
                            <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                              <div className="grid md:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <h5 className="font-medium mb-2 text-green-400">Input:</h5>
                                  <pre className="bg-black/20 p-2 rounded text-sm overflow-x-auto font-mono border border-white/10">
                                    {example.input}
                                  </pre>
                                </div>
                                <div>
                                  <h5 className="font-medium mb-2 text-blue-400">Output:</h5>
                                  <pre className="bg-black/20 p-2 rounded text-sm overflow-x-auto font-mono border border-white/10">
                                    {example.output}
                                  </pre>
                                </div>
                              </div>
                              {example.explanation && (
                                <div>
                                  <h5 className="font-medium mb-2 text-yellow-400">Explanation:</h5>
                                  <p className="text-muted-foreground text-sm bg-black/20 p-2 rounded border border-white/10">
                                    {example.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Constraints */}
                    {selectedProblem.constraints && selectedProblem.constraints.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Constraints</h4>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            {selectedProblem.constraints.map((constraint, index) => (
                              <li key={index} className="text-sm font-mono">{constraint}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Code Editor - Enhanced with better controls */}
                <Card className="glass border border-white/10">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <CardTitle className="flex items-center">
                        <Code className="w-5 h-5 mr-2" />
                        Solution
                        {problemAttempts[selectedProblem._id]?.submitted && (
                          <Badge className="ml-3 bg-neon-green/20 text-neon-green border-neon-green/40">
                            Submitted
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center space-x-4">
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className="w-40 bg-white/5 border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={handleSubmit}
                          disabled={submitMutation.isPending || problemAttempts[selectedProblem?._id]?.submitted}
                          className="bg-neon-green hover:bg-neon-green/80 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[600px]"> {/* Fixed height container for editor */}
                      <CodeEditor
                        language={selectedLanguage}
                        value={code}
                        onChange={setCode}
                        onLanguageChange={setSelectedLanguage}
                        onRun={handleRun}
                        onSubmit={handleSubmit}
                        isRunning={isRunning}
                        isSubmitting={isSubmitting}
                        readOnly={problemAttempts[selectedProblem?._id]?.submitted}
                        isFullscreen={isFullscreen}
                        onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Test Results - New section for displaying test results */}
                {lastRunResult && (
                  <Card className="glass border border-white/10 mt-4">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        Test Results
                        <Badge className={`ml-3 ${
                          lastRunResult.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {lastRunResult.passed ? 'All Passed' : 'Failed'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {lastRunResult.error ? (
                        <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                          {lastRunResult.error}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {lastRunResult.testResults.map((result, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${
                              result.pass ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">Test Case {index + 1}</h4>
                                <Badge className={result.pass ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                  {result.pass ? 'Passed' : 'Failed'}
                                </Badge>
                              </div>
                              <div className="grid gap-4">
                                <div>
                                  <div className="text-sm font-medium mb-1">Input:</div>
                                  <pre className="bg-black/20 p-2 rounded text-sm font-mono overflow-x-auto">
                                    {result.input}
                                  </pre>
                                </div>
                                <div>
                                  <div className="text-sm font-medium mb-1">Expected:</div>
                                  <pre className="bg-black/20 p-2 rounded text-sm font-mono overflow-x-auto">
                                    {result.expected}
                                  </pre>
                                </div>
                                {result.output && (
                                  <div>
                                    <div className="text-sm font-medium mb-1">Output:</div>
                                    <pre className="bg-black/20 p-2 rounded text-sm font-mono overflow-x-auto">
                                      {result.output}
                                    </pre>
                                  </div>
                                )}
                                {result.error && (
                                  <div className="text-red-400 text-sm mt-2">{result.error}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="glass border border-white/10">
                <CardContent className="text-center py-16">
                  <Code className="h-20 w-20 mx-auto text-muted-foreground mb-6 opacity-50" />
                  <h3 className="text-2xl font-semibold mb-3">Select a Problem</h3>
                  <p className="text-muted-foreground text-lg">Choose a problem from the list to start coding and see the problem details.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestArenaPage;