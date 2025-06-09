import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, Award, Crown, Clock } from 'lucide-react';
import type { RankingEntry } from '@/types/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ContestRankingsPage = () => {
  const { contestId } = useParams<{ contestId: string }>();

  const { data: rankingsDoc, isLoading, error } = useQuery({
    queryKey: ['contest-rankings', contestId],
    queryFn: () => api.getContestRankings(contestId!),
    enabled: !!contestId,
    retry: 1,
    retryDelay: 2000,
  });

  // Extract rankings array or handle empty
  const rankings = rankingsDoc?.rankings || [];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold">{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">1st Place</Badge>;
      case 2:
        return <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-black">2nd Place</Badge>;
      case 3:
        return <Badge className="bg-gradient-to-r from-amber-500 to-amber-700 text-white">3rd Place</Badge>;
      default:
        return <Badge variant="outline">#{rank}</Badge>;
    }
  };

  const formatPenalty = (penalty: number) => {
    const hours = Math.floor(penalty / 60);
    const minutes = Math.floor(penalty % 60);
    return `${hours}h ${minutes}m`;
  };

  // Add submissions viewing state
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);

  // Add submissions query
  const { data: submissions } = useQuery({
    queryKey: ['contest-submissions', contestId, selectedUser],
    queryFn: () => api.getContestSubmissions(contestId!, selectedUser),
    enabled: !!contestId && showSubmissions && !!selectedUser
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-purple mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Rankings</h2>
          <p className="text-muted-foreground">This may take a moment while we calculate the results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.message || 'Unknown error';
    if (
      errorMessage.includes('not available') ||
      errorMessage.includes('being generated') ||
      errorMessage.includes('not found')
    ) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="glass border border-white/10 max-w-md">
            <CardContent className="text-center py-8">
              <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Rankings Not Available</h3>
              <p className="text-muted-foreground">
                Contest rankings will be available once the contest has ended.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading rankings</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!rankings || rankings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass border border-white/10 max-w-md">
          <CardContent className="text-center py-8">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Rankings Available</h3>
            <p className="text-muted-foreground">
              No participants have solved any problems yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
            Contest Rankings
          </h1>
          <p className="text-muted-foreground">
            Final leaderboard showing participant performance and rankings.
          </p>
        </div>

        {/* Top 3 Podium */}
        {rankings.length >= 3 && (
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              {/* 2nd Place */}
              <div className="text-center pt-8">
                <Card className="glass border border-gray-300/20 hover:border-gray-300/40 transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center">
                      <Medal className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold truncate">{rankings[1].user.email}</h3>
                    <p className="text-sm text-muted-foreground">
                      {rankings[1].problemsSolved} problems
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPenalty(rankings[1].penalty)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <Card className="glass border border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Crown className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-semibold truncate">{rankings[0].user.email}</h3>
                    <p className="text-sm text-muted-foreground">
                      {rankings[0].problemsSolved} problems
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPenalty(rankings[0].penalty)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 3rd Place */}
              <div className="text-center pt-8">
                <Card className="glass border border-amber-500/20 hover:border-amber-500/40 transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold truncate">{rankings[2].user.email}</h3>
                    <p className="text-sm text-muted-foreground">
                      {rankings[2].problemsSolved} problems
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPenalty(rankings[2].penalty)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Full Rankings Table */}
        <Card className="glass border border-white/10">
          <CardHeader>
            <CardTitle>Full Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-center">Problems Solved</TableHead>
                  <TableHead className="text-center">Total Time</TableHead>
                  {rankingsDoc?.problems?.map((problem: any) => (
                    <TableHead key={problem._id} className="text-center">
                      {problem.title}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.map((entry, index) => (
                  <TableRow key={entry.user._id} className="hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{entry.user.email}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {entry.problemsSolved}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-sm">
                        {formatPenalty(entry.totalTime)}
                      </span>
                    </TableCell>
                    {entry.problemStats?.map((stat: any) => (
                      <TableCell key={stat.problemId._id} className="text-center">
                        {stat.solved ? (
                          <div className="flex flex-col items-center">
                            <Badge className="bg-green-500/20 text-green-400">
                              ✓ {formatPenalty(stat.solveTime)}
                            </Badge>
                            {stat.attempts > 1 && (
                              <span className="text-xs text-muted-foreground mt-1">
                                {stat.attempts} attempts
                              </span>
                            )}
                          </div>
                        ) : stat.attempts > 0 ? (
                          <Badge className="bg-red-500/20 text-red-400">
                            ✗ ({stat.attempts})
                          </Badge>
                        ) : (
                          "−"
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(entry.user._id);
                          setShowSubmissions(true);
                        }}
                      >
                        View Submissions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Submissions Dialog */}
        {showSubmissions && selectedUser && (
          <Dialog open={showSubmissions} onOpenChange={setShowSubmissions}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Submissions</DialogTitle>
              </DialogHeader>
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Problem</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Language</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions?.map((sub: any) => (
                      <TableRow key={sub._id}>
                        <TableCell>{sub.problemId.title}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              sub.status === 'Accepted'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }
                          >
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(sub.submittedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{sub.language}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ContestRankingsPage;
