
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, Code, TrendingUp, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { Problem, User, AdminStats } from '@/types/api';

const Admin = () => {
  const [newProblem, setNewProblem] = useState<Partial<Problem>>({
    title: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    difficulty: 'Easy',
    topicTag: '',
    testCases: [{ input: '', expected: '' }]
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [reloadCount, setReloadCount] = useState(100);

  const queryClient = useQueryClient();

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats') as Promise<AdminStats>,
  });

  const { data: problems = [], isLoading: problemsLoading } = useQuery({
    queryKey: ['admin-problems'],
    queryFn: () => api.getProblems() as Promise<Problem[]>,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users') as Promise<User[]>,
  });

  // Mutations
  const createProblemMutation = useMutation({
    mutationFn: (problemData: Partial<Problem>) => api.post('/problems', problemData),
    onSuccess: () => {
      toast.success('Problem created successfully');
      setIsCreateDialogOpen(false);
      setNewProblem({
        title: '',
        description: '',
        inputFormat: '',
        outputFormat: '',
        difficulty: 'Easy',
        topicTag: '',
        testCases: [{ input: '', expected: '' }]
      });
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create problem');
    },
  });

  const deleteProblemMutation = useMutation({
    mutationFn: (problemId: string) => api.delete(`/problems/${problemId}`),
    onSuccess: () => {
      toast.success('Problem deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete problem');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/users/${userId}`),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  const reloadProblemsMutation = useMutation({
    mutationFn: (count: number) => api.post('/admin/reload-problems', { count }),
    onSuccess: () => {
      toast.success('Problems reloaded successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-problems'] });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reload problems');
    },
  });

  const isLoading = statsLoading || problemsLoading || usersLoading;

  const handleCreateProblem = () => {
    if (!newProblem.title || !newProblem.description) {
      toast.error('Title and description are required');
      return;
    }
    createProblemMutation.mutate(newProblem);
  };

  const addTestCase = () => {
    setNewProblem(prev => ({
      ...prev,
      testCases: [...(prev.testCases || []), { input: '', expected: '' }]
    }));
  };

  const updateTestCase = (index: number, field: 'input' | 'expected', value: string) => {
    setNewProblem(prev => ({
      ...prev,
      testCases: prev.testCases?.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const removeTestCase = (index: number) => {
    setNewProblem(prev => ({
      ...prev,
      testCases: prev.testCases?.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage problems, users, and platform statistics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
              <BookOpen className="h-4 w-4 text-neon-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProblems || 0}</div>
              <p className="text-xs text-muted-foreground">across all difficulties</p>
            </CardContent>
          </Card>

          <Card className="glass border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-neon-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">registered users</p>
            </CardContent>
          </Card>

          <Card className="glass border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Code className="h-4 w-4 text-neon-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSubmissions || 0}</div>
              <p className="text-xs text-muted-foreground">code submissions</p>
            </CardContent>
          </Card>

          <Card className="glass border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-neon-pink" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">vs last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Problems by Difficulty Chart */}
              <Card className="glass border border-white/10">
                <CardHeader>
                  <CardTitle>Problems by Difficulty</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.problemsByDifficulty || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="_id" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Topics */}
              <Card className="glass border border-white/10">
                <CardHeader>
                  <CardTitle>Popular Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.topTopics?.map((topic, index) => (
                      <div key={topic._id} className="flex items-center justify-between">
                        <span className="font-medium">{topic._id}</span>
                        <Badge variant="outline">{topic.count} problems</Badge>
                      </div>
                    )) || []}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Problems Tab */}
          <TabsContent value="problems" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Problems</h2>
              <div className="flex space-x-2">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Problem
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Problem</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={newProblem.title}
                            onChange={(e) => setNewProblem(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="topicTag">Topic Tag</Label>
                          <Input
                            id="topicTag"
                            value={newProblem.topicTag}
                            onChange={(e) => setNewProblem(prev => ({ ...prev, topicTag: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select value={newProblem.difficulty} onValueChange={(value) => 
                          setNewProblem(prev => ({ ...prev, difficulty: value as 'Easy' | 'Medium' | 'Hard' }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          rows={4}
                          value={newProblem.description}
                          onChange={(e) => setNewProblem(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="inputFormat">Input Format</Label>
                          <Textarea
                            id="inputFormat"
                            rows={3}
                            value={newProblem.inputFormat}
                            onChange={(e) => setNewProblem(prev => ({ ...prev, inputFormat: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="outputFormat">Output Format</Label>
                          <Textarea
                            id="outputFormat"
                            rows={3}
                            value={newProblem.outputFormat}
                            onChange={(e) => setNewProblem(prev => ({ ...prev, outputFormat: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Label>Test Cases</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add Test Case
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {newProblem.testCases?.map((testCase, index) => (
                            <div key={index} className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Input</Label>
                                <Textarea
                                  rows={2}
                                  value={testCase.input}
                                  onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                                />
                              </div>
                              <div className="flex space-x-2">
                                <div className="flex-1">
                                  <Label className="text-xs">Expected Output</Label>
                                  <Textarea
                                    rows={2}
                                    value={testCase.expected}
                                    onChange={(e) => updateTestCase(index, 'expected', e.target.value)}
                                  />
                                </div>
                                {(newProblem.testCases?.length || 0) > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeTestCase(index)}
                                    className="self-end"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )) || []}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateProblem} disabled={createProblemMutation.isPending}>
                          {createProblemMutation.isPending ? 'Creating...' : 'Create Problem'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-4">
              {Array.isArray(problems) && problems.map((problem: Problem) => (
                <Card key={problem._id} className="glass border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{problem.title}</h3>
                          <Badge className={`text-xs ${
                            problem.difficulty === 'Easy' ? 'difficulty-easy' :
                            problem.difficulty === 'Medium' ? 'difficulty-medium' :
                            'difficulty-hard'
                          }`}>
                            {problem.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {problem.topicTag}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {problem.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteProblemMutation.mutate(problem._id)}
                          disabled={deleteProblemMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Users</h2>
            </div>

            <div className="space-y-4">
              {Array.isArray(users) && users.map((user: User) => (
                <Card key={user._id} className="glass border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold">{user.email}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                              {user.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {user.role !== 'admin' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteUserMutation.mutate(user._id)}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-6">
              <Card className="glass border border-white/10">
                <CardHeader>
                  <CardTitle>Problem Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Label htmlFor="reloadCount">Number of problems to reload</Label>
                      <Input
                        id="reloadCount"
                        type="number"
                        value={reloadCount}
                        onChange={(e) => setReloadCount(Number(e.target.value))}
                        className="w-32"
                      />
                    </div>
                    <Button 
                      onClick={() => reloadProblemsMutation.mutate(reloadCount)}
                      disabled={reloadProblemsMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {reloadProblemsMutation.isPending ? 'Reloading...' : 'Reload Problems'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This will reload problems from Codeforces. Existing problems will not be affected.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
