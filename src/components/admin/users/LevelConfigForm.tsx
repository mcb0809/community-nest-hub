
import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LevelConfig {
  id: string;
  level_number: number;
  level_name: string;
  required_xp: number;
  color: string;
  icon: string;
}

const LevelConfigForm = () => {
  const [configs, setConfigs] = useState<LevelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('level_config')
        .select('*')
        .order('level_number');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching level config:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải cấu hình level",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (index: number, field: string, value: any) => {
    const updatedConfigs = [...configs];
    updatedConfigs[index] = { ...updatedConfigs[index], [field]: value };
    setConfigs(updatedConfigs);
  };

  const addNewLevel = () => {
    const nextLevel = Math.max(...configs.map(c => c.level_number)) + 1;
    const newConfig: LevelConfig = {
      id: '',
      level_number: nextLevel,
      level_name: `Level ${nextLevel}`,
      required_xp: nextLevel * 1000,
      color: '#8B5CF6',
      icon: '⭐'
    };
    setConfigs([...configs, newConfig]);
  };

  const removeLevel = (index: number) => {
    const updatedConfigs = configs.filter((_, i) => i !== index);
    setConfigs(updatedConfigs);
  };

  const saveConfigs = async () => {
    setSaving(true);
    try {
      // Delete existing configs first
      await supabase.from('level_config').delete().gte('level_number', 1);

      // Insert updated configs
      const updates = configs.map(config => ({
        level_number: config.level_number,
        level_name: config.level_name,
        required_xp: config.required_xp,
        color: config.color,
        icon: config.icon,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('level_config')
        .insert(updates);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã cập nhật cấu hình level",
      });

      // Refresh configs to get IDs
      await fetchConfigs();
    } catch (error) {
      console.error('Error saving level config:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu cấu hình level",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    const defaultConfigs: LevelConfig[] = [
      { id: '', level_number: 1, level_name: 'Người mới', required_xp: 0, color: '#10B981', icon: '🌱' },
      { id: '', level_number: 2, level_name: 'Học viên', required_xp: 1000, color: '#3B82F6', icon: '📚' },
      { id: '', level_number: 3, level_name: 'Tích cực', required_xp: 2500, color: '#8B5CF6', icon: '⚡' },
      { id: '', level_number: 4, level_name: 'Chuyên gia', required_xp: 5000, color: '#F59E0B', icon: '🎯' },
      { id: '', level_number: 5, level_name: 'Bậc thầy', required_xp: 8500, color: '#EF4444', icon: '🏆' },
      { id: '', level_number: 6, level_name: 'Huyền thoại', required_xp: 15000, color: '#EC4899', icon: '👑' },
      { id: '', level_number: 7, level_name: 'Siêu sao', required_xp: 25000, color: '#6366F1', icon: '🌟' },
      { id: '', level_number: 8, level_name: 'Vô địch', required_xp: 40000, color: '#8B5CF6', icon: '💎' },
      { id: '', level_number: 9, level_name: 'Thần thoại', required_xp: 65000, color: '#F59E0B', icon: '🔥' },
      { id: '', level_number: 10, level_name: 'Bất bại', required_xp: 100000, color: '#EF4444', icon: '🚀' }
    ];
    setConfigs(defaultConfigs);
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
          Cấu hình Level hệ thống
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addNewLevel}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm Level
            </Button>
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Level</TableHead>
                <TableHead className="text-slate-300">Tên Level</TableHead>
                <TableHead className="text-slate-300">XP yêu cầu</TableHead>
                <TableHead className="text-slate-300">Màu sắc</TableHead>
                <TableHead className="text-slate-300">Icon</TableHead>
                <TableHead className="text-slate-300">Preview</TableHead>
                <TableHead className="text-slate-300">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config, index) => (
                <TableRow key={index} className="border-slate-700">
                  <TableCell>
                    <Input
                      type="number"
                      value={config.level_number}
                      onChange={(e) => handleConfigChange(index, 'level_number', parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={config.level_name}
                      onChange={(e) => handleConfigChange(index, 'level_name', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={config.required_xp}
                      onChange={(e) => handleConfigChange(index, 'required_xp', parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={config.color}
                        onChange={(e) => handleConfigChange(index, 'color', e.target.value)}
                        className="w-8 h-8 rounded border border-slate-600"
                      />
                      <Input
                        value={config.color}
                        onChange={(e) => handleConfigChange(index, 'color', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white w-24"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={config.icon}
                      onChange={(e) => handleConfigChange(index, 'icon', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white w-16"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{config.icon}</span>
                      <span 
                        className="px-2 py-1 rounded text-white text-sm font-medium"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.level_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeLevel(index)}
                      className="border-red-600 text-red-400 hover:bg-red-600/10"
                      disabled={configs.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg space-y-3">
          <p className="text-sm text-slate-400">
            <strong>📊 Cấu hình Level:</strong> Quản lý toàn bộ hệ thống level của website.
          </p>
          <p className="text-sm text-slate-400">
            <strong>🔢 XP yêu cầu:</strong> Số điểm kinh nghiệm cần thiết để đạt level này.
          </p>
          <p className="text-sm text-slate-400">
            <strong>🎨 Màu sắc & Icon:</strong> Tùy chỉnh giao diện hiển thị level trong hệ thống.
          </p>
          <p className="text-sm text-slate-400">
            <strong>⚠️ Lưu ý:</strong> Thay đổi cấu hình sẽ ảnh hưởng đến toàn bộ hệ thống level và được cập nhật realtime.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelConfigForm;
