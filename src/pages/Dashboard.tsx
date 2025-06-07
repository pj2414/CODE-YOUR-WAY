import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Trophy, Target, Clock, CheckCircle, Code, TrendingUp,
  BookOpen, ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import type { Problem, Submission } from '@/types/api';
import { toast } from 'sonner'; // Changed from react-toastify to sonner

const DIFFICULTY_COLORS = {
  Easy: '#4ade80',
  Medium: '#f59e0b',
  Hard: '#ef4444'
};

const Dashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboardStats(),
    // Add these options to help with debugging and retrying
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard stats');
    }
  });

  // Add this for debugging
  useEffect(() => {
    console.log('Dashboard data:', dashboardData);
  }, [dashboardData]);

  // Destructure with default values to prevent undefined errors
  const {
    totalProblems = 0,
    solvedProblems = 0,
    completionRate = 0,
    streak = 0,
    totalSubmissions = 0,
    difficultyStats = [],
    recentSubmissions = []
  } = dashboardData || {};

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
          <h2 className="text-2xl font-bold mb-2">Failed to load dashboard</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your coding progress and achievements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <CheckCircle className="h-4 w-4 text-neon-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{solvedProblems}</div>
              <p className="text-xs text-muted-foreground">
                of {totalProblems} total problems
              </p>
            </CardContent>
          </Card>

          <Card className="glass border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-neon-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="glass border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Trophy className="h-4 w-4 text-neon-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak}</div>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>

          <Card className="glass border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Code className="h-4 w-4 text-neon-pink" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">code submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Difficulty Progress */}
          <Card className="glass border border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Progress by Difficulty</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="solved" name="Solved" fill="#8B5CF6" />
                    <Bar dataKey="total" name="Total" fill="#374151" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card className="glass border border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Submissions</span>
                </div>
                <Link 
                  to="/submissions"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center"
                >
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <Link
                    key={submission._id}
                    to={`/problems/${submission.problemId._id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          submission.result?.passed ? 'bg-neon-green' : 'bg-destructive'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{submission.problemId.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(submission.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={submission.result?.passed ? 'default' : 'destructive'}>
                          {submission.result?.passed ? 'Passed' : 'Failed'}
                        </Badge>
                        <Badge variant="outline" className={`
                          ${submission.problemId.difficulty === 'Easy' ? 'text-difficulty-easy' :
                            submission.problemId.difficulty === 'Medium' ? 'text-difficulty-medium' :
                            'text-difficulty-hard'}
                        `}>
                          {submission.problemId.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}

                {recentSubmissions.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No submissions yet</p>
                    <Link 
                      to="/problems" 
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      Start solving problems
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
