
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, User } from 'lucide-react';
import type { DiscussionThread } from '@/types/api';

interface DiscussionThreadProps {
  thread: DiscussionThread;
  onThreadClick: (threadId: string) => void;
}

const DiscussionThreadComponent: React.FC<DiscussionThreadProps> = ({ 
  thread, 
  onThreadClick 
}) => {
  return (
    <Card 
      className="glass hover:glass-strong transition-all duration-300 hover:scale-[1.01] cursor-pointer"
      onClick={() => onThreadClick(thread._id)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold hover:text-neon-purple transition-colors">
          {thread.title}
        </CardTitle>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{thread.userId.email}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {thread.content}
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            <MessageCircle className="h-3 w-3 mr-1" />
            Discussion
          </Badge>
          <span className="text-xs text-muted-foreground">
            Updated {new Date(thread.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionThreadComponent;
