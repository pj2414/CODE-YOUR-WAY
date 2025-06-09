
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Calendar, Users, Trophy, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Contest } from '@/types/api';

const AdminContestsDashboard = () => {
  const { data: contests, isLoading, error } = useQuery({
    queryKey: ['admin-contests'],
    queryFn: () => api.getAdminContests() as Promise<Contest[]>,
  });

  const getStatusBadge = (contest: Contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) {
      return <Badge className="bg-green-500 hover:bg-green-600">Upcoming</Badge>;
    } else if (now > end) {
      return <Badge variant="secondary">Finished</Badge>;
    } else {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Running</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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
          <h1 className="text-2xl font-bold mb-4">Error loading contests</h1>
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Contest Management</h1>
              <p className="text-muted-foreground">
                Create, manage, and monitor coding contests for your platform.
              </p>
            </div>
            <Link to="/admin/contests/create">
              <Button className="bg-neon-purple hover:bg-neon-purple/80">
                <Plus className="w-4 h-4 mr-2" />
                Create New Contest
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {contests && contests.length > 0 && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="glass border border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-neon-blue" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Contests</p>
                    <p className="text-2xl font-bold">{contests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-neon-green" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Running</p>
                    <p className="text-2xl font-bold">
                      {contests.filter(c => {
                        const now = new Date();
                        return now >= new Date(c.startTime) && now <= new Date(c.endTime);
                      }).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-neon-purple" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                    <p className="text-2xl font-bold">
                      {contests.reduce((sum, contest) => sum + (contest.participants?.length || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-neon-pink" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Finished</p>
                    <p className="text-2xl font-bold">
                      {contests.filter(c => new Date() > new Date(c.endTime)).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contests Table */}
        <Card className="glass border border-white/10">
          <CardHeader>
            <CardTitle>All Contests</CardTitle>
          </CardHeader>
          <CardContent>
            {contests && contests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead className="text-center">Room ID</TableHead>
                    <TableHead className="text-center">Participants</TableHead>
                    <TableHead className="text-center">Problems</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contests.map((contest) => (
                    <TableRow key={contest._id} className="hover:bg-white/5">
                      <TableCell>
                        <div>
                          <div className="font-medium">{contest.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {contest.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contest)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDateTime(contest.startTime)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDateTime(contest.endTime)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">
                          {contest.roomId}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {contest.participants?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {contest.problems?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(contest.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contests created yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first coding contest.
                </p>
                <Link to="/admin/contests/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Contest
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminContestsDashboard;
