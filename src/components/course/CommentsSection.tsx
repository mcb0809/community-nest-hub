
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, MessageCircle, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Comment {
  id: string;
  user_name: string;
  user_email: string | null;
  content: string;
  rating: number | null;
  created_at: string;
}

interface CommentsSectionProps {
  courseId: string;
}

const CommentsSection = ({ courseId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState({
    user_name: '',
    user_email: '',
    content: '',
    rating: 5
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [courseId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải bình luận",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.user_name.trim() || !newComment.content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          course_id: courseId,
          user_name: newComment.user_name.trim(),
          user_email: newComment.user_email.trim() || null,
          content: newComment.content.trim(),
          rating: newComment.rating
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Bình luận của bạn đã được thêm",
      });

      setNewComment({
        user_name: '',
        user_email: '',
        content: '',
        rating: 5
      });
      
      fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi bình luận",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-slate-400'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingInput = () => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-slate-400">Đánh giá:</span>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setNewComment({ ...newComment, rating: star })}
              className="p-1"
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  star <= newComment.rating
                    ? 'text-yellow-400 fill-yellow-400 hover:text-yellow-500'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="glass border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <Card className="glass border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Để lại bình luận
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Tên của bạn *"
                value={newComment.user_name}
                onChange={(e) => setNewComment({ ...newComment, user_name: e.target.value })}
                className="bg-slate-800/50 border-slate-600 text-white"
                required
              />
              <Input
                type="email"
                placeholder="Email (tùy chọn)"
                value={newComment.user_email}
                onChange={(e) => setNewComment({ ...newComment, user_email: e.target.value })}
                className="bg-slate-800/50 border-slate-600 text-white"
              />
            </div>
            
            {renderRatingInput()}
            
            <Textarea
              placeholder="Viết bình luận của bạn về khóa học..."
              value={newComment.content}
              onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white min-h-[100px]"
              required
            />
            
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card className="glass border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">
            Bình luận ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-slate-800/30 rounded-lg border border-slate-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{comment.user_name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                    {comment.rating && renderStars(comment.rating)}
                  </div>
                  
                  <p className="text-slate-300 leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-400">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentsSection;
