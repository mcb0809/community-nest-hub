
import React, { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface XPConfig {
  key: string;
  value: number;
  description: string | null;
}

const XPConfigForm = () => {
  const [configs, setConfigs] = useState<XPConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('xp_config')
        .select('*')
        .order('key');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching XP config:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải cấu hình XP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setConfigs(configs.map(config => 
      config.key === key ? { ...config, value: numValue } : config
    ));
  };

  const saveConfigs = async () => {
    setSaving(true);
    try {
      const updates = configs.map(config => ({
        key: config.key,
        value: config.value,
        description: config.description,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('xp_config')
        .upsert(updates);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã cập nhật cấu hình XP",
      });
    } catch (error) {
      console.error('Error saving XP config:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu cấu hình XP",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    const defaultConfigs = [
      { key: 'like', value: 100, description: 'XP earned for liking a post' },
      { key: 'comment', value: 200, description: 'XP earned for commenting on a post' },
      { key: 'share', value: 300, description: 'XP earned for sharing a post' },
      { key: 'complete_course', value: 400, description: 'XP earned for completing a course' },
      { key: 'write_post', value: 350, description: 'XP earned for writing a post' },
    ];
    setConfigs(defaultConfigs);
  };

  const getActionLabel = (key: string) => {
    const labels: Record<string, string> = {
      'like': 'Like bài viết',
      'comment': 'Bình luận',
      'share': 'Chia sẻ',
      'complete_course': 'Hoàn thành khóa học',
      'write_post': 'Viết bài',
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          Cấu hình bảng điểm XP
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={saveConfigs}
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {configs.map((config) => (
          <div key={config.key} className="space-y-2">
            <Label htmlFor={config.key} className="text-slate-300">
              {getActionLabel(config.key)}
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id={config.key}
                type="number"
                value={config.value}
                onChange={(e) => handleValueChange(config.key, e.target.value)}
                className="bg-slate-700 border-slate-600 text-white max-w-32"
                placeholder="0"
              />
              <span className="text-purple-400 font-medium">XP</span>
              {config.description && (
                <span className="text-sm text-slate-400">{config.description}</span>
              )}
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
          <p className="text-sm text-slate-400 mb-2">
            <strong>Lưu ý:</strong> Thay đổi cấu hình XP sẽ áp dụng cho tất cả hoạt động mới. 
            Điểm XP đã tích lũy trước đó sẽ không bị ảnh hưởng.
          </p>
          <p className="text-xs text-slate-500">
            Hệ thống sẽ tự động tính toán level dựa trên tổng XP theo công thức: Level = ⌊√(XP/100)⌋ + 1
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default XPConfigForm;
