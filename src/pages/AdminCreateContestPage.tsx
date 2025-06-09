import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Clock, Code, Save } from 'lucide-react';
import type { Problem } from '@/types/api';

interface ContestFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  problemIds: string[];
}

const PROBLEMS_PER_PAGE = 10; // Show only 10 problems at a time

const AdminCreateContestPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const form = useForm<ContestFormData>({
    defaultValues: {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      problemIds: [],
    },
  });

  // Modified query to use pagination
  const { data: problemsData, isLoading: problemsLoading } = useQuery({
    queryKey: ['admin-problems', currentPage],
    queryFn: () => api.getProblems(currentPage, PROBLEMS_PER_PAGE),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  // Defensive: fallback to empty array if problemsData or problemsData.problems is missing
  const problems = Array.isArray(problemsData?.problems) ? problemsData.problems : [];
  const totalPages = problemsData?.totalPages || 1;

  const filteredProblems = useMemo(() => {
    return problems.filter(problem => 
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.topicTag.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [problems, searchTerm]);

  const createContestMutation = useMutation({
    mutationFn: async (data: ContestFormData) => {
      setIsSubmitting(true);
      try {
        return await api.createContest({
          ...data,
          problems: Array.from(selectedProblems)
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contest created successfully!",
      });
      navigate('/admin/contests');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create contest",
        variant: "destructive",
      });
    },
  });

  const handleProblemToggle = (problemId: string) => {
    const newSelected = new Set(selectedProblems);
    if (newSelected.has(problemId)) {
      newSelected.delete(problemId);
    } else {
      newSelected.add(problemId);
    }
    setSelectedProblems(newSelected);
    form.setValue('problemIds', Array.from(newSelected));
  };

  const onSubmit = (data: ContestFormData) => {
    if (selectedProblems.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one problem",
        variant: "destructive",
      });
      return;
    }

    if (new Date(data.startTime) >= new Date(data.endTime)) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    createContestMutation.mutate({
      ...data,
      problems: Array.from(selectedProblems),
    });
  };

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 60 * 60 * 1000);
  const defaultEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (problemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/contests')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contests
          </Button>
          <h1 className="text-3xl font-bold mb-2">Create New Contest</h1>
          <p className="text-muted-foreground">
            Set up a new coding contest with selected problems and timing.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card className="glass border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Contest Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contest Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contest title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the contest..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    rules={{ required: "Start time is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            min={formatDateTimeLocal(now)}
                            defaultValue={formatDateTimeLocal(defaultStart)}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    rules={{ required: "End time is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            min={formatDateTimeLocal(defaultStart)}
                            defaultValue={formatDateTimeLocal(defaultEnd)}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Problem Selection */}
            <Card className="glass border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    Select Problems
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedProblems.size} selected
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      placeholder="Search problems..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {problems.length === 0 ? (
                      <div className="col-span-2 text-center text-muted-foreground py-8">
                        No problems found.
                      </div>
                    ) : (
                      problems.map((problem) => (
                        <div
                          key={problem._id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedProblems.has(problem._id)
                              ? 'border-neon-purple bg-neon-purple/10'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          onClick={() => handleProblemToggle(problem._id)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={e => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              handleProblemToggle(problem._id);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              checked={selectedProblems.has(problem._id)}
                              onClick={e => e.stopPropagation()}
                              onCheckedChange={() => handleProblemToggle(problem._id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{problem.title}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                  problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {problem.difficulty}
                                </span>
                              </div>
                              <span className="text-xs bg-white/10 px-2 py-1 rounded">
                                {problem.topicTag}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {!problemsLoading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/contests')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createContestMutation.isPending || isSubmitting}
                className="bg-neon-green hover:bg-neon-green/80"
              >
                <Save className="w-4 h-4 mr-2" />
                {createContestMutation.isPending || isSubmitting ? 'Creating...' : 'Create Contest'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AdminCreateContestPage;
