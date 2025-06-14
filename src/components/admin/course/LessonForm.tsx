
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Upload, X, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const lessonSchema = z.object({
  title: z.string().min(1, 'Tên bài học là bắt buộc'),
  video_url: z.string().optional(),
  content_md: z.string().optional(),
  attachment_url: z.string().optional(),
  is_preview: z.boolean(),
  order_index: z.number().min(0),
});

type LessonFormData = z.infer<typeof lessonSchema>;

interface LessonFormProps {
  moduleId: string;
  lesson?: any;
  onSuccess: () => void;
}

const LessonForm = ({ moduleId, lesson, onSuccess }: LessonFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<string>(lesson?.attachment_url || '');
  const { toast } = useToast();

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || '',
      video_url: lesson?.video_url || '',
      content_md: lesson?.content_md || '',
      attachment_url: lesson?.attachment_url || '',
      is_preview: lesson?.is_preview || false,
      order_index: lesson?.order_index || 0,
    },
  });

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `lesson-attachments/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('course-files')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('course-files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const fileUrl = await uploadFile(file);
      setAttachmentFile(fileUrl);
      form.setValue('attachment_url', fileUrl);
      toast({
        title: "Thành công",
        description: "Đã tải lên tài liệu đính kèm",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên tài liệu",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const extractYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const onSubmit = async (data: LessonFormData) => {
    setIsSubmitting(true);
    try {
      const lessonData = {
        module_id: moduleId,
        title: data.title,
        video_url: data.video_url,
        content_md: data.content_md,
        attachment_url: data.attachment_url,
        is_preview: data.is_preview,
        order_index: data.order_index,
        updated_at: new Date().toISOString(),
      };

      if (lesson) {
        // Update existing lesson
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', lesson.id);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Bài học đã được cập nhật",
        });
      } else {
        // Create new lesson
        const { error } = await supabase
          .from('lessons')
          .insert([lessonData]);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Bài học đã được tạo",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu bài học",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const videoId = form.watch('video_url') ? extractYouTubeVideoId(form.watch('video_url')) : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Tên bài học</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên bài học..."
                      {...field}
                      className="glass border-slate-600 text-white placeholder-slate-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Link video YouTube</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      {...field}
                      className="glass border-slate-600 text-white placeholder-slate-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order_index"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Thứ tự</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="glass border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_preview"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4 glass">
                  <div className="space-y-0.5">
                    <FormLabel className="text-white">Bài học miễn phí</FormLabel>
                    <div className="text-sm text-slate-400">
                      Cho phép học viên xem trước bài học này
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* File Attachment */}
            <FormField
              control={form.control}
              name="attachment_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Tài liệu đính kèm</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {attachmentFile ? (
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-600 glass">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-cyan-400" />
                            <span className="text-white text-sm">Tài liệu đã tải lên</span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setAttachmentFile('');
                              field.onChange('');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center glass">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-400 text-sm">Chọn tài liệu đính kèm (PDF, DOC, ZIP...)</p>
                        </div>
                      )}
                      
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingFile}
                        onClick={() => document.getElementById('attachment-upload')?.click()}
                        className="border-slate-600 text-white hover:bg-slate-700 w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingFile ? 'Đang tải...' : 'Chọn tài liệu'}
                      </Button>
                      <input
                        id="attachment-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.zip,.rar"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Video Preview */}
            {videoId && (
              <div className="space-y-2">
                <label className="text-white font-medium">Xem trước video</label>
                <div className="aspect-video rounded-lg overflow-hidden border border-slate-600">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="Video preview"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="content_md"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nội dung bài học (Markdown)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập nội dung bài học bằng Markdown..."
                      {...field}
                      className="glass border-slate-600 text-white placeholder-slate-400 min-h-[300px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-600">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
          >
            {isSubmitting ? 'Đang lưu...' : lesson ? 'Cập nhật' : 'Tạo bài học'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LessonForm;
