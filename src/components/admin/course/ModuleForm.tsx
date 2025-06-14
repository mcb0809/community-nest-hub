
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const moduleSchema = z.object({
  title: z.string().min(1, 'Tên module là bắt buộc'),
  description: z.string().optional(),
  order_index: z.number().min(0),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface ModuleFormProps {
  courseId: string;
  module?: any;
  onSuccess: () => void;
}

const ModuleForm = ({ courseId, module, onSuccess }: ModuleFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: module?.title || '',
      description: module?.description || '',
      order_index: module?.order_index || 0,
    },
  });

  const onSubmit = async (data: ModuleFormData) => {
    setIsSubmitting(true);
    try {
      const moduleData = {
        course_id: courseId,
        title: data.title,
        description: data.description,
        order_index: data.order_index,
        updated_at: new Date().toISOString(),
      };

      if (module) {
        // Update existing module
        const { error } = await supabase
          .from('modules')
          .update(moduleData)
          .eq('id', module.id);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Module đã được cập nhật",
        });
      } else {
        // Create new module
        const { error } = await supabase
          .from('modules')
          .insert([moduleData]);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Module đã được tạo",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving module:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu module",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Tên module</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập tên module..."
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
                  placeholder="Mô tả module..."
                  {...field}
                  className="glass border-slate-600 text-white placeholder-slate-400 min-h-[100px]"
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

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-600">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
          >
            {isSubmitting ? 'Đang lưu...' : module ? 'Cập nhật' : 'Tạo module'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ModuleForm;
