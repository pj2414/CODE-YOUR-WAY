import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Clock, Trophy, Users, Play } from 'lucide-react';
import { formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import type { ContestList } from '@/types/api';

const ContestsListPage = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const { data: contests, isLoading, error } = useQuery({
    queryKey: ['contests'],
    queryFn: () => api.getContests() as Promise<{
      running: Contest[];
      upcoming: Contest[];
      finished: Contest[];
    }>,
  });

  const handleJoinContest = async () => {
    if (!roomId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Room ID",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      const response = await api.joinContest(roomId);
      toast({
        title: "Success",
        description: response.message,
      });
      setJoinDialogOpen(false);
      setRoomId('');
      if (response.contestId) {
        navigate(`/contests/${response.contestId}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to join contest",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleEnterContest = (contest: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to join contests",
        variant: "destructive",
      });
      return;
    }

    if (new Date() > new Date(contest.endTime)) {
      navigate(`/contests/${contest._id}/rankings`);
      return;
    }

    setRoomId('');
    setJoinDialogOpen(true);
  };

  const getStatusBadge = (contest: any) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (isBefore(now, start)) {
      return <Badge className="bg-green-500 hover:bg-green-600">Upcoming</Badge>;
    } else if (isAfter(now, end)) {
      return <Badge variant="secondary">Finished</Badge>;
    } else {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Running</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Fix categorization: only show contests in correct section
  const runningContests = contests?.running?.filter(
    c => new Date() >= new Date(c.startTime) && new Date() <= new Date(c.endTime)
  ) || [];
  const upcomingContests = contests?.upcoming?.filter(
    c => new Date() < new Date(c.startTime)
  ) || [];
  const finishedContests = contests?.finished?.filter(
    c => new Date() > new Date(c.endTime)
  ) || [];

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
              <h1 className="text-3xl font-bold mb-2">Coding Contests</h1>
              <p className="text-muted-foreground">
                Participate in competitive programming contests and improve your skills.
              </p>
            </div>
            
            {isAuthenticated && (
              <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-neon-purple hover:bg-neon-purple/80">
                    <Users className="w-4 h-4 mr-2" />
                    Join Contest
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Contest</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Room ID</label>
                      <Input
                        placeholder="Enter contest room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleJoinContest} 
                      disabled={isJoining}
                      className="w-full"
                    >
                      {isJoining ? 'Joining...' : 'Join Contest'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Running Contests */}
        {runningContests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Play className="w-6 h-6 mr-2 text-blue-500" />
              Running Now
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {runningContests.map((contest) => (
                <Card key={contest._id} className="glass border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{contest.title}</CardTitle>
                      {getStatusBadge(contest)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{contest.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Started: {formatDistanceToNow(new Date(contest.startTime), { addSuffix: true })}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {contest.participants?.length || 0} participants
                      </div>
                    </div>
                    <div className="mt-4">
                      {new Date() > new Date(contest.endTime) ? (
                        <Link to={`/contests/${contest._id}/rankings`}>
                          <Button className="w-full bg-secondary hover:bg-secondary/80">
                            View Rankings
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          className="w-full bg-blue-500 hover:bg-blue-600"
                          onClick={() => handleEnterContest(contest)}
                        >
                          Enter Contest
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Contests */}
        {upcomingContests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-green-500" />
              Upcoming
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingContests.map((contest) => (
                <Card key={contest._id} className="glass border border-green-500/20 hover:border-green-500/40 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{contest.title}</CardTitle>
                      {getStatusBadge(contest)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{contest.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Starts: {formatDateTime(contest.startTime)}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {contest.participants?.length || 0} registered
                      </div>
                    </div>
                  </CardContent>
                  <div className="mt-4">
                    <Button 
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Starts {formatDistanceToNow(new Date(contest.startTime), { addSuffix: true })}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Finished Contests */}
        {finishedContests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
              Finished
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finishedContests.map((contest) => (
                <Card key={contest._id} className="glass border border-white/10 hover:border-white/20 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{contest.title}</CardTitle>
                      {getStatusBadge(contest)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{contest.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Ended: {formatDistanceToNow(new Date(contest.endTime), { addSuffix: true })}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {contest.participants?.length || 0} participants
                      </div>
                    </div>
                  </CardContent>
                  <div className="mt-4">
                    <Link to={`/contests/${contest._id}/rankings`}>
                      <Button variant="outline" className="w-full">
                        View Rankings
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {contests && !upcomingContests.length && !runningContests.length && !finishedContests.length && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contests available</h3>
            <p className="text-muted-foreground">Check back later for upcoming contests!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestsListPage;
