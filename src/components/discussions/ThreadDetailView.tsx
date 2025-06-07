
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, User, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { ThreadWithPosts } from '@/types/api';

interface ThreadDetailViewProps {
  threadData: ThreadWithPosts;
  onAddPost: (content: string) => Promise<void>;
  onBack: () => void;
}

const ThreadDetailView: React.FC<ThreadDetailViewProps> = ({ 
  threadData, 
  onAddPost, 
  onBack 
}) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPostContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddPost(newPostContent.trim());
      setNewPostContent('');
      toast.success('Reply posted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Back to Discussions</h2>
      </div>

      {/* Original Thread */}
      <Card className="glass border border-white/20">
        <CardHeader>
          <CardTitle className="text-lg">{threadData.thread.title}</CardTitle>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{threadData.thread.userId.email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(threadData.thread.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {threadData.thread.content}
          </p>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Replies ({threadData.posts.length})
        </h3>
        
        <ScrollArea className="h-96">
          <div className="space-y-3 pr-4">
            {threadData.posts.map((post) => (
              <Card key={post._id} className="glass border border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{post.userId.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </CardContent>
              </Card>
            ))}
            
            {threadData.posts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No replies yet. Be the first to reply!
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Add Reply Form */}
      <Card className="glass border border-white/20">
        <CardHeader>
          <CardTitle className="text-lg">Add a Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <Textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Write your reply..."
              className="glass border-white/20 focus:border-neon-purple min-h-24"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <Button type="submit" className="btn-primary" disabled={isSubmitting}>
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreadDetailView;
