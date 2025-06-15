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
      { key: 'daily_login', value: 100, description: 'XP earned for daily login streak' },
      { key: 'hourly_online', value: 20, description: 'XP earned per hour online' },
      { key: 'send_message', value: 1, description: 'XP earned for sending a chat message' },
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
      'daily_login': 'Đăng nhập hàng ngày',
      'hourly_online': 'Mỗi giờ online',
      'send_message': 'Gửi tin nhắn Chat',
    };
    return labels[key] || key;
  };

  const getActionIcon = (key: string) => {
    const icons: Record<string, string> = {
      'like': '👍',
      'comment': '💬',
      'share': '📤',
      'complete_course': '🎓',
      'write_post': '✍️',
      'daily_login': '📅',
      'hourly_online': '⏰',
      'send_message': '✉️',
    };
    return icons[key] || '⚡';
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
      <CardContent className="space-y-6">
        {/* Basic Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">
            Hoạt động cơ bản
          </h3>
          {configs.filter(config => ['like', 'comment', 'share', 'write_post', 'complete_course', 'send_message'].includes(config.key)).map((config) => (
            <div key={config.key} className="space-y-2">
              <Label htmlFor={config.key} className="text-slate-300 flex items-center space-x-2">
                <span className="text-lg">{getActionIcon(config.key)}</span>
                <span>{getActionLabel(config.key)}</span>
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
        </div>

        {/* Engagement & Time-based Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">
            Tương tác & Thời gian
          </h3>
          {configs.filter(config => ['daily_login', 'hourly_online'].includes(config.key)).map((config) => (
            <div key={config.key} className="space-y-2">
              <Label htmlFor={config.key} className="text-slate-300 flex items-center space-x-2">
                <span className="text-lg">{getActionIcon(config.key)}</span>
                <span>{getActionLabel(config.key)}</span>
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
                <span className="text-sm text-slate-400">
                  {config.key === 'daily_login' ? '/ ngày streak' : '/ giờ'}
                </span>
                {config.description && (
                  <span className="text-sm text-slate-400">- {config.description}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg space-y-3">
          <p className="text-sm text-slate-400">
            <strong>📅 Streak hàng ngày:</strong> User nhận XP khi đăng nhập liên tiếp mỗi ngày. 
            Streak sẽ reset nếu bỏ lỡ 1 ngày.
          </p>
          <p className="text-sm text-slate-400">
            <strong>⏰ Thời gian online:</strong> XP được tích lũy dựa trên số giờ user active trên website. 
            Hệ thống tự động theo dõi và cập nhật.
          </p>
          <p className="text-sm text-slate-400">
            <strong>🔄 Cập nhật:</strong> Thay đổi cấu hình XP sẽ áp dụng cho tất cả hoạt động mới. 
            Điểm XP đã tích lũy trước đó sẽ không bị ảnh hưởng.
          </p>
          <p className="text-xs text-slate-500">
            Level = ⌊√(Total XP/100)⌋ + 1
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default XPConfigForm;
