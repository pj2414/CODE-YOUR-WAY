
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProblemFilterProps {
  selectedDifficulty: string;
  selectedTopic: string;
  topics: string[];
  onDifficultyChange: (difficulty: string) => void;
  onTopicChange: (topic: string) => void;
}

const ProblemFilter: React.FC<ProblemFilterProps> = ({ 
  selectedDifficulty,
  selectedTopic,
  topics,
  onDifficultyChange,
  onTopicChange
}) => {
  const difficulties = ['all', 'Easy', 'Medium', 'Hard'];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Difficulty Filter */}
      <div className="min-w-40">
        <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger className="glass border-white/20">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent className="glass-strong border border-white/20">
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty === 'all' ? 'All Difficulties' : difficulty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Topic Filter */}
      <div className="min-w-40">
        <Select value={selectedTopic} onValueChange={onTopicChange}>
          <SelectTrigger className="glass border-white/20">
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent className="glass-strong border border-white/20 max-h-60">
            <SelectItem value="all">All Topics</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic} value={topic}>
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProblemFilter;
