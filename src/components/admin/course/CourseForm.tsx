
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const courseSchema = z.object({
  title: z.string().min(1, 'Tên khóa học là bắt buộc'),
  description: z.string().optional(),
  category: z.string().min(1, 'Danh mục là bắt buộc'),
  level: z.number().min(1).max(10),
  total_hours: z.number().min(0),
  price: z.number().min(0),
  is_public: z.boolean(),
  thumbnail_url: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: any;
  onSuccess: () => void;
}

const CourseForm = ({ course, onSuccess }: CourseFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(course?.thumbnail_url || '');
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

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `course-thumbnails/${fileName}`;

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage(file);
      setPreviewImage(imageUrl);
      form.setValue('thumbnail_url', imageUrl);
      toast({
        title: "Thành công",
        description: "Đã tải lên ảnh thumbnail",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên ảnh",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      const courseData = {
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        total_hours: data.total_hours,
        price: data.price,
        is_public: data.is_public,
        thumbnail_url: data.thumbnail_url,
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
          description: "Khóa học đã được tạo",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu khóa học",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <FormLabel className="text-white">Tên khóa học</FormLabel>
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả khóa học..."
                      {...field}
                      className="glass border-slate-600 text-white placeholder-slate-400 min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Danh mục</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass border-slate-600 text-white">
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="Web Development" className="text-white">Web Development</SelectItem>
                        <SelectItem value="Mobile Development" className="text-white">Mobile Development</SelectItem>
                        <SelectItem value="Data Science" className="text-white">Data Science</SelectItem>
                        <SelectItem value="AI/ML" className="text-white">AI/ML</SelectItem>
                        <SelectItem value="Blockchain" className="text-white">Blockchain</SelectItem>
                        <SelectItem value="DevOps" className="text-white">DevOps</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Cấp độ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="glass border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Tổng giờ học</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        className="glass border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Giá (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        className="glass border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4 glass">
                  <div className="space-y-0.5">
                    <FormLabel className="text-white">Công khai khóa học</FormLabel>
                    <div className="text-sm text-slate-400">
                      Cho phép học viên xem và đăng ký khóa học này
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
          </div>

          {/* Right Column - Image Upload */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Ảnh thumbnail</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {previewImage ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-slate-600">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setPreviewImage('');
                              field.onChange('');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center glass">
                          <div className="text-center">
                            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-400">Chọn ảnh thumbnail</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingImage}
                          onClick={() => document.getElementById('thumbnail-upload')?.click()}
                          className="border-slate-600 text-white hover:bg-slate-700"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingImage ? 'Đang tải...' : 'Chọn ảnh'}
                        </Button>
                        <input
                          id="thumbnail-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>
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
            {isSubmitting ? 'Đang lưu...' : course ? 'Cập nhật' : 'Tạo khóa học'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CourseForm;
