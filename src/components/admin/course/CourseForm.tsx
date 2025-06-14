import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

const courseSchema = z.object({
  title: z.string().min(1, 'Tên khóa học là bắt buộc'),
  description: z.string().optional(),
  category: z.string().min(1, 'Danh mục là bắt buộc'),
  level: z.number().min(1).max(3),
  total_hours: z.number().min(0),
  price: z.number().min(0),
  is_public: z.boolean(),
  thumbnail_url: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  level: number;
  total_hours: number;
  price: number;
  is_public: boolean;
}

interface CourseFormProps {
  course?: Course;
  onSuccess: () => void;
}

const categories = [
  'Giáo Dục',
  'AI',
  'Automation',
  'Kỹ năng mềm',
  'Marketing',
  'Công nghệ',
  'Kinh doanh'
];

const CourseForm: React.FC<CourseFormProps> = ({ course, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(course?.thumbnail_url || '');
  const { toast } = useToast();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title || '',
      description: course?.description || '',
      category: course?.category || '',
      level: course?.level || 1,
      total_hours: course?.total_hours || 0,
      price: course?.price || 0,
      is_public: course?.is_public ?? true,
      thumbnail_url: course?.thumbnail_url || '',
    },
  });

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `course-thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('course-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('course-files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      setLoading(true);

      let thumbnailUrl = data.thumbnail_url;
      
      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(thumbnailFile);
      }

      const courseData = {
        ...data,
        thumbnail_url: thumbnailUrl,
        updated_at: new Date().toISOString(),
      };

      if (course) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', course.id);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Khóa học đã được cập nhật",
        });
      } else {
        // Create new course
        const { error } = await supabase
          .from('courses')
          .insert([courseData]);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Khóa học đã được tạo thành công",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu khóa học. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Thumbnail Upload */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-white">Ảnh bìa khóa học</label>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail-upload"
              />
              <label htmlFor="thumbnail-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-400">
                  Click để tải lên ảnh bìa hoặc kéo thả file vào đây
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </label>
            </div>
          </div>
          
          {thumbnailPreview && (
            <div className="lg:w-64">
              <div className="relative">
                <img
                  src={thumbnailPreview}
                  alt="Preview"
                  className="w-full aspect-video object-cover rounded-lg"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setThumbnailPreview('');
                    setThumbnailFile(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="lg:col-span-2">
                  <FormLabel className="text-white">Tên khóa học *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên khóa học..."
                      {...field}
                      className="glass border-slate-600 text-white placeholder-slate-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Danh mục *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="glass border-slate-600 text-white">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-white hover:bg-slate-700">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Level */}
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Yêu cầu cấp độ</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="glass border-slate-600 text-white">
                        <SelectValue placeholder="Chọn cấp độ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="1" className="text-white hover:bg-slate-700">Cấp độ 1</SelectItem>
                      <SelectItem value="2" className="text-white hover:bg-slate-700">Cấp độ 2</SelectItem>
                      <SelectItem value="3" className="text-white hover:bg-slate-700">Cấp độ 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Hours */}
            <FormField
              control={form.control}
              name="total_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Tổng số giờ học</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="glass border-slate-600 text-white placeholder-slate-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Giá tiền (VNĐ)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="glass border-slate-600 text-white placeholder-slate-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Giới thiệu khóa học</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Mô tả chi tiết về khóa học..."
                    className="min-h-[120px] glass border-slate-600 text-white placeholder-slate-400"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Public Toggle */}
          <FormField
            control={form.control}
            name="is_public"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4 glass">
                <div className="space-y-0.5">
                  <FormLabel className="text-white font-medium">Hiển thị khóa học</FormLabel>
                  <div className="text-sm text-slate-400">
                    Cho phép mọi người xem và đăng ký khóa học này
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

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              {loading ? 'Đang lưu...' : (course ? 'Cập nhật khóa học' : 'Tạo khóa học')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CourseForm;
