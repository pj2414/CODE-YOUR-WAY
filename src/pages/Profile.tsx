
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Trophy, Code, Target, Star } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    bio: 'Passionate developer who loves solving algorithmic problems',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev'
  });

  const handleSave = () => {
    setIsEditing(false);
    // API call to save profile data would go here
  };

  const achievements = [
    { name: 'First Submission', icon: Code, color: 'neon-blue' },
    { name: 'Problem Solver', icon: Target, color: 'neon-green' },
    { name: 'Code Warrior', icon: Trophy, color: 'neon-purple' },
    { name: 'Rising Star', icon: Star, color: 'neon-pink' }
  ];

  const stats = [
    { label: 'Problems Solved', value: '42', color: 'text-neon-green' },
    { label: 'Success Rate', value: '78%', color: 'text-neon-blue' },
    { label: 'Current Streak', value: '7 days', color: 'text-neon-purple' },
    { label: 'Total Submissions', value: '156', color: 'text-neon-pink' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card className="glass border border-white/10">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24 border-2 border-neon-purple">
                  <AvatarFallback className="bg-gradient-to-r from-neon-purple to-neon-blue text-white text-2xl">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{formData.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <Badge variant="outline" className="mt-2 border-neon-purple text-neon-purple">
                {user?.role === 'admin' ? 'Administrator' : 'Developer'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="glass border-white/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="glass border-white/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="glass border-white/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="glass border-white/20"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} className="btn-primary flex-1">
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">{formData.bio}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{formData.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined December 2024</span>
                  </div>
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="btn-primary w-full mt-4"
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats and Achievements */}
        <div className="lg:col-span-2 space-y-8">
          {/* Statistics */}
          <Card className="glass border border-white/10">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Your coding journey at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-4 glass rounded-lg">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="glass border border-white/10">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Badges you've earned along the way</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center p-4 glass rounded-lg hover:glass-strong transition-all group"
                  >
                    <div className={`p-3 rounded-full bg-gradient-to-r from-${achievement.color} to-${achievement.color}/70 group-hover:scale-110 transition-transform mb-2`}>
                      <achievement.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-center">{achievement.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass border border-white/10">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest coding activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Solved', problem: 'Two Sum', difficulty: 'Easy', time: '2 hours ago' },
                  { action: 'Attempted', problem: 'Binary Tree Traversal', difficulty: 'Medium', time: '5 hours ago' },
                  { action: 'Solved', problem: 'Valid Parentheses', difficulty: 'Easy', time: '1 day ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${activity.action === 'Solved' ? 'bg-neon-green' : 'bg-neon-blue'}`}></div>
                      <span className="font-medium">{activity.action}</span>
                      <span className="text-foreground">{activity.problem}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.difficulty}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
