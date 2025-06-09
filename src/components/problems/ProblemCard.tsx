import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Star, Bookmark, CheckCircle } from 'lucide-react';

interface Problem {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topicTag: string;
  rating?: number;
  createdAt: string;
}

interface ProblemCardProps {
  problem: Problem;
  viewMode?: 'grid' | 'list';
  isBookmarked?: boolean;
  isSolved?: boolean;
  onBookmark?: (problemId: string) => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ 
  problem, 
  viewMode = 'grid',
  isBookmarked = false, 
  isSolved = false,
  onBookmark 
}) => {
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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

  if (viewMode === 'list') {
    return (
      <Card className="glass hover:glass-strong transition-all duration-300 hover:scale-[1.01] group">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex-1 mb-2 sm:mb-0">
              <div className="flex items-center space-x-3">
                <Link to={`/problems/${problem._id}`} className="group-hover:text-neon-purple transition-colors">
                  <h3 className="font-semibold text-lg">{problem.title}</h3>
                </Link>
                <div className="flex items-center space-x-2">
                  <Badge className={getDifficultyClass(problem.difficulty)}>
                    {problem.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {problem.topicTag}
                  </Badge>
                  {isSolved && (
                    <CheckCircle className="h-4 w-4 text-neon-green" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-start sm:items-center space-x-4">
              {problem.rating && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3" />
                  <span>{problem.rating}</span>
                </div>
              )}
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
              </div>
              <Link to={`/problems/${problem._id}`}>
                <Button size="sm" className="btn-primary text-xs px-3 py-1">
                  Solve
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass hover:glass-strong transition-all duration-300 hover:scale-[1.02] group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold group-hover:text-neon-purple transition-colors line-clamp-2">
              <Link to={`/problems/${problem._id}`}>
                {problem.title}
              </Link>
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={getDifficultyClass(problem.difficulty)}>
                {problem.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {problem.topicTag}
              </Badge>
              {isSolved && (
                <CheckCircle className="h-4 w-4 text-neon-green" />
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {problem.rating && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3" />
                <span>{problem.rating}</span>
              </div>
            )}
            {onBookmark && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onBookmark(problem._id)}
                className={`p-1 ${isBookmarked ? 'text-neon-blue' : 'text-muted-foreground'}`}
              >
                <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
          </div>
          
          <Link to={`/problems/${problem._id}`}>
            <Button size="sm" className="btn-primary text-xs px-3 py-1">
              Solve
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProblemCard;
