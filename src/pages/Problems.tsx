import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import ProblemCard from '@/components/problems/ProblemCard';
import ProblemFilter from '@/components/problems/ProblemFilter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Grid, List } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Problem } from '@/types/api';

const Problems = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ['problems', currentPage],
    queryFn: () => api.getProblems(currentPage, ITEMS_PER_PAGE) as Promise<Problem[]>,
  });

  const filteredProblems = useMemo(() => {
    if (!data?.problems) return [];
    
    return data.problems.filter((problem: Problem) => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
      const matchesTopic = selectedTopic === 'all' || problem.topicTag === selectedTopic;
      
      return matchesSearch && matchesDifficulty && matchesTopic;
    });
  }, [data?.problems, searchTerm, selectedDifficulty, selectedTopic]);

  const topics = useMemo(() => {
    if (!Array.isArray(data?.problems)) return [];
    
    const uniqueTopics = [...new Set(data.problems.map((p: Problem) => p.topicTag))];
    return uniqueTopics.filter(Boolean) as string[];
  }, [data?.problems]);

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
          <h1 className="text-2xl font-bold mb-4">Error loading problems</h1>
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
          <h1 className="text-3xl font-bold mb-4">Problem Set</h1>
          <p className="text-muted-foreground mb-6">
            Practice your coding skills with our curated collection of algorithmic challenges.
          </p>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <ProblemFilter
              selectedDifficulty={selectedDifficulty}
              selectedTopic={selectedTopic}
              topics={topics}
              onDifficultyChange={setSelectedDifficulty}
              onTopicChange={setSelectedTopic}
            />

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredProblems.length} of {data?.totalProblems} problems
          </div>
        </div>

        {/* Problems Grid/List */}
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredProblems.map((problem: Problem) => (
            <ProblemCard key={problem._id} problem={problem} viewMode={viewMode} />
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No problems found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && data?.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
                    disabled={currentPage === data.totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default Problems;
