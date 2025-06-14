
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe,
  Edit3,
  Save,
  Eye,
  Image,
  Type,
  Palette,
  Star,
  Users,
  BookOpen,
  Calendar,
  MessageCircle,
  FileText,
  Trophy
} from 'lucide-react';

const AdminLandingPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [heroData, setHeroData] = useState({
    title: 'AI AUTOMATION CLUB Plus',
    subtitle: 'MCB AI',
    description: 'Cộng đồng tiên phong về AI, Automation & Workflow MMO\nNơi bạn có thể học – chia sẻ – kiếm tiền cùng cộng đồng',
    primaryButton: 'Tham gia cộng đồng',
    secondaryButton: 'Khám phá nội dung miễn phí'
  });

  const [aboutData, setAboutData] = useState({
    title: 'Cộng đồng tiên phong về AI',
    description: 'AI Automation Club là nơi kết nối những người đam mê tự động hóa và AI, nơi bạn có thể học – chia sẻ – kiếm tiền cùng cộng đồng.',
    features: [
      'Cập nhật kiến thức AI & Automation liên tục',
      'Khóa học miễn phí & chuyên sâu',
      'Cộng đồng thảo luận chất lượng cao',
      'Tích hợp AI Assistant cá nhân'
    ]
  });

  const [stats, setStats] = useState([
    { number: '500+', label: 'Thành viên' },
    { number: '50+', label: 'Khóa học' },
    { number: '1000+', label: 'Bài viết' },
    { number: '24/7', label: 'AI Support' }
  ]);

  const previewTabs = [
    { name: 'Khóa học', icon: BookOpen, description: 'Khóa học chất lượng cao' },
    { name: 'Sự kiện', icon: Calendar, description: 'Sự kiện cộng đồng' },
    { name: 'Thảo luận', icon: MessageCircle, description: 'Thảo luận và chia sẻ' },
    { name: 'Tài liệu', icon: FileText, description: 'Tài liệu tham khảo' },
    { name: 'Xếp hạng', icon: Trophy, description: 'Bảng xếp hạng' },
    { name: 'Thành viên', icon: Users, description: 'Cộng đồng thành viên' }
  ];

  const handleSave = () => {
    // TODO: Save to database
    setIsEditing(false);
    console.log('Saving landing page data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Landing Page</h1>
          <p className="text-slate-400">Chỉnh sửa nội dung trang chủ cho người dùng chưa đăng nhập</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
          >
            <Eye className="w-4 h-4 mr-2" />
            Xem trước
          </Button>
          {isEditing ? (
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="hero" className="data-[state=active]:bg-purple-500/20">
            <Type className="w-4 h-4 mr-2" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-purple-500/20">
            <Globe className="w-4 h-4 mr-2" />
            About Section
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-purple-500/20">
            <Eye className="w-4 h-4 mr-2" />
            Preview Tabs
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-purple-500/20">
            <Star className="w-4 h-4 mr-2" />
            AI Helper
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Type className="w-5 h-5 text-purple-400" />
                <span>Hero Section</span>
                <Badge className="bg-purple-500/20 text-purple-300">Phần đầu trang</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Tiêu đề chính</label>
                    <Input
                      value={heroData.title}
                      onChange={(e) => setHeroData({...heroData, title: e.target.value})}
                      disabled={!isEditing}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Tiêu đề phụ</label>
                    <Input
                      value={heroData.subtitle}
                      onChange={(e) => setHeroData({...heroData, subtitle: e.target.value})}
                      disabled={!isEditing}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Mô tả</label>
                    <Textarea
                      value={heroData.description}
                      onChange={(e) => setHeroData({...heroData, description: e.target.value})}
                      disabled={!isEditing}
                      rows={4}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Nút chính</label>
                  <Input
                    value={heroData.primaryButton}
                    onChange={(e) => setHeroData({...heroData, primaryButton: e.target.value})}
                    disabled={!isEditing}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Nút phụ</label>
                  <Input
                    value={heroData.secondaryButton}
                    onChange={(e) => setHeroData({...heroData, secondaryButton: e.target.value})}
                    disabled={!isEditing}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Stats */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-4 block">Thống kê hiển thị</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <Card key={index} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <Input
                          value={stat.number}
                          onChange={(e) => {
                            const newStats = [...stats];
                            newStats[index].number = e.target.value;
                            setStats(newStats);
                          }}
                          disabled={!isEditing}
                          className="bg-slate-600/50 border-slate-500 text-white text-center font-bold mb-2"
                        />
                        <Input
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...stats];
                            newStats[index].label = e.target.value;
                            setStats(newStats);
                          }}
                          disabled={!isEditing}
                          className="bg-slate-600/50 border-slate-500 text-white text-center text-sm"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Section */}
        <TabsContent value="about">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Globe className="w-5 h-5 text-purple-400" />
                <span>About Section</span>
                <Badge className="bg-purple-500/20 text-purple-300">Giới thiệu</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Tiêu đề</label>
                  <Input
                    value={aboutData.title}
                    onChange={(e) => setAboutData({...aboutData, title: e.target.value})}
                    disabled={!isEditing}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Mô tả</label>
                  <Textarea
                    value={aboutData.description}
                    onChange={(e) => setAboutData({...aboutData, description: e.target.value})}
                    disabled={!isEditing}
                    rows={3}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-4 block">Tính năng nổi bật</label>
                <div className="space-y-3">
                  {aboutData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-purple-400 font-bold">🚀</span>
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...aboutData.features];
                          newFeatures[index] = e.target.value;
                          setAboutData({...aboutData, features: newFeatures});
                        }}
                        disabled={!isEditing}
                        className="bg-slate-700/50 border-slate-600 text-white flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tabs */}
        <TabsContent value="preview">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Eye className="w-5 h-5 text-purple-400" />
                <span>Preview Tabs</span>
                <Badge className="bg-purple-500/20 text-purple-300">Xem trước</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {previewTabs.map((tab, index) => (
                  <Card key={index} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <tab.icon className="w-5 h-5 text-purple-400" />
                        <Input
                          value={tab.name}
                          disabled={!isEditing}
                          className="bg-slate-600/50 border-slate-500 text-white flex-1"
                        />
                      </div>
                      <Textarea
                        value={tab.description}
                        disabled={!isEditing}
                        rows={2}
                        className="bg-slate-600/50 border-slate-500 text-white text-sm"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Helper */}
        <TabsContent value="ai">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Star className="w-5 h-5 text-purple-400" />
                <span>AI Helper Box</span>
                <Badge className="bg-purple-500/20 text-purple-300">Trợ lý AI</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-slate-700/30 rounded-lg border border-purple-500/20">
                <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">AI Assistant Demo</h3>
                <p className="text-slate-400 mb-4">Cấu hình demo chat AI để thu hút người dùng</p>
                <Button 
                  variant="outline" 
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                >
                  Cấu hình AI Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLandingPage;
