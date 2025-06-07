
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import DiscussionThreadComponent from './DiscussionThread';
import CreateThreadDialog from './CreateThreadDialog';
import ThreadDetailView from './ThreadDetailView';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import type { DiscussionThread, ThreadWithPosts } from '@/types/api';

interface DiscussionPanelProps {
  problemId: string;
}

const DiscussionPanel: React.FC<DiscussionPanelProps> = ({ problemId }) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch discussion threads
  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ['discussions', problemId],
    queryFn: () => api.getDiscussionThreads(problemId) as Promise<DiscussionThread[]>,
  });

  // Fetch thread details with posts
  const { data: threadData, isLoading: threadLoading } = useQuery({
    queryKey: ['thread', selectedThreadId],
    queryFn: () => api.getThreadWithPosts(selectedThreadId!) as Promise<ThreadWithPosts>,
    enabled: !!selectedThreadId,
  });

  // Create thread mutation
  const createThreadMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      api.createDiscussionThread(problemId, title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', problemId] });
    },
  });

  // Add post mutation
  const addPostMutation = useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      api.addPostToThread(threadId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', selectedThreadId] });
    },
  });

  const handleCreateThread = async (title: string, content: string) => {
    await createThreadMutation.mutateAsync({ title, content });
  };

  const handleAddPost = async (content: string) => {
    if (!selectedThreadId) return;
    await addPostMutation.mutateAsync({ threadId: selectedThreadId, content });
  };

  const handleThreadClick = (threadId: string) => {
    setSelectedThreadId(threadId);
  };

  const handleBack = () => {
    setSelectedThreadId(null);
  };

  if (selectedThreadId && threadData) {
    return (
      <ThreadDetailView
        threadData={threadData}
        onAddPost={handleAddPost}
        onBack={handleBack}
      />
    );
  }

  if (threadsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Discussions ({threads.length})</h3>
        </div>
        <CreateThreadDialog onCreateThread={handleCreateThread} />
      </div>

      {/* Threads List */}
      <ScrollArea className="h-96">
        <div className="space-y-4 pr-4">
          {threads.map((thread) => (
            <DiscussionThreadComponent
              key={thread._id}
              thread={thread}
              onThreadClick={handleThreadClick}
            />
          ))}
          
          {threads.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
              <p className="text-muted-foreground mb-4">
                Start the first discussion about this problem!
              </p>
              <CreateThreadDialog onCreateThread={handleCreateThread} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DiscussionPanel;
