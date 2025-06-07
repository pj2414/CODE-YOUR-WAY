import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Submissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: submissions = [], isLoading, error } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => api.getSubmissions()
  });

  console.log('Raw submissions:', submissions); // Add this for debugging

  const filteredSubmissions = useMemo(() => {
    if (!Array.isArray(submissions)) return [];
    
    return submissions.filter((submission) => {
      const matchesSearch = submission.problemId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = languageFilter === 'all' || submission.language === languageFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'passed' && submission.result?.passed) ||
        (statusFilter === 'failed' && !submission.result?.passed);
      
      return matchesSearch && matchesLanguage && matchesStatus;
    });
  }, [submissions, searchTerm, languageFilter, statusFilter]);

  const languages = useMemo(() => {
    if (!Array.isArray(submissions)) return [];
    const uniqueLanguages = [...new Set(submissions.map(s => s.language))];
    return uniqueLanguages;
  }, [submissions]);

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
          <h1 className="text-2xl font-bold mb-4">Error loading submissions</h1>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Submissions</h1>
          <p className="text-muted-foreground">
            View and track all your code submissions and their results.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by problem name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <Card key={submission._id} className="glass border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      submission.result?.passed ? 'bg-neon-green' : 'bg-destructive'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-lg">{submission.problemId?.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {submission.language}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${
                          submission.problemId?.difficulty === 'Easy' ? 'text-difficulty-easy' :
                          submission.problemId?.difficulty === 'Medium' ? 'text-difficulty-medium' :
                          'text-difficulty-hard'
                        }`}>
                          {submission.problemId?.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant={submission.result?.passed ? 'default' : 'destructive'} className="mb-2">
                      {submission.result?.passed ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {submission.result?.passed ? 'Passed' : 'Failed'}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(submission.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                {/* Test Results Summary */}
                {submission.result?.testResults && (
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Test Results</span>
                      <span className="text-xs text-muted-foreground">
                        {submission.result.testResults.filter(t => t.pass).length} / {submission.result.testResults.length} passed
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {submission.result.testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-sm ${
                            result.pass ? 'bg-neon-green' : 'bg-destructive'
                          }`}
                          title={`Test ${index + 1}: ${result.pass ? 'Passed' : 'Failed'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">
                <XCircle className="h-full w-full" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
              <p className="text-muted-foreground">
                {Array.isArray(submissions) && submissions.length === 0 
                  ? 'Start solving problems to see your submissions here.'
                  : 'Try adjusting your search criteria or filters.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Submissions;
