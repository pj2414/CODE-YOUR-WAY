
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, BarChart3, Trophy, Plus } from 'lucide-react';
import type { AdminStats } from '@/types/api';

const Admin = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats() as Promise<AdminStats>,
  });

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your platform's problems, users, and contests.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="glass border border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-neon-blue" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Problems</p>
                    <p className="text-2xl font-bold">{stats.totalProblems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-neon-green" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-neon-purple" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                    <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-neon-pink" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Contests</p>
                    <p className="text-2xl font-bold">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Management Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/problems">
            <Card className="glass border border-white/10 hover:border-neon-blue/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-neon-blue" />
                  Manage Problems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create, edit, and organize coding problems for your platform.
                </p>
                <Button className="w-full bg-neon-blue hover:bg-neon-blue/80">
                  View Problems
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/users">
            <Card className="glass border border-white/10 hover:border-neon-green/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-neon-green" />
                  Manage Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View and manage user accounts and permissions.
                </p>
                <Button className="w-full bg-neon-green hover:bg-neon-green/80">
                  View Users
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/contests">
            <Card className="glass border border-white/10 hover:border-neon-purple/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-neon-purple" />
                  Manage Contests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create and manage coding contests for your platform.
                </p>
                <Button className="w-full bg-neon-purple hover:bg-neon-purple/80">
                  View Contests
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/contests/create">
            <Card className="glass border border-white/10 hover:border-neon-pink/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-neon-pink" />
                  Create Contest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create a new coding contest with selected problems.
                </p>
                <Button className="w-full bg-neon-pink hover:bg-neon-pink/80">
                  Create New
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Admin;