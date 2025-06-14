
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
  Type,
  Star,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  MessageCircle,
  FileText,
  Trophy,
  Folder,
  Monitor
} from 'lucide-react';
import { useLandingPage } from '@/contexts/LandingPageContext';
import { useToast } from '@/hooks/use-toast';
import LandingPagePreview from '@/components/admin/LandingPagePreview';

const AdminLandingPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data, updateHero, updateAbout, updateStats, updatePreviewTabs, updateAIHelper } = useLandingPage();
  const { toast } = useToast();

  // Local state for editing
  const [heroData, setHeroData] = useState(data.hero);
  const [aboutData, setAboutData] = useState(data.about);
  const [stats, setStats] = useState(data.stats);
  const [previewTabs, setPreviewTabs] = useState(data.previewTabs);
  const [aiHelperData, setAIHelperData] = useState(data.aiHelper);

  const handleSave = () => {
    updateHero(heroData);
    updateAbout(aboutData);
    updateStats(stats);
    updatePreviewTabs(previewTabs);
    updateAIHelper(aiHelperData);
    setIsEditing(false);
    
    toast({
      title: "Đã lưu thành công",
      description: "Thay đổi đã được áp dụng cho landing page",
    });
  };

  const handleCancel = () => {
    setHeroData(data.hero);
    setAboutData(data.about);
    setStats(data.stats);
    setPreviewTabs(data.previewTabs);
    setAIHelperData(data.aiHelper);
    setIsEditing(false);
  };

  const iconMap = {
    'BookOpen': BookOpen,
    'Calendar': Calendar,
    'FileText': FileText,
    'MessageCircle': MessageCircle,
    'Folder': Folder,
    'Trophy': Trophy
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
            onClick={() => window.open('/landing', '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Xem trước
          </Button>
          {isEditing ? (
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={handleCancel}
                className="border-red-500/50 text-red-300 hover:bg-red-500/10"
              >
                Hủy
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </div>
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

      {/* Main Content with Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Section */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="hero" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
              <TabsTrigger value="hero" className="data-[state=active]:bg-purple-500/20">
                <Type className="w-4 h-4 mr-2" />
                Hero
              </TabsTrigger>
              <TabsTrigger value="about" className="data-[state=active]:bg-purple-500/20">
                <Globe className="w-4 h-4 mr-2" />
                About
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-purple-500/20">
                <Eye className="w-4 h-4 mr-2" />
                Tabs
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
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
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
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block">Mô tả</label>
                      <Textarea
                        value={heroData.description}
                        onChange={(e) => setHeroData({...heroData, description: e.target.value})}
                        disabled={!isEditing}
                        rows={3}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                      <label className="text-sm font-medium text-slate-300 mb-4 block">Thống kê</label>
                      <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, index) => (
                          <div key={index} className="space-y-2">
                            <Input
                              value={stat.number}
                              onChange={(e) => {
                                const newStats = [...stats];
                                newStats[index].number = e.target.value;
                                setStats(newStats);
                              }}
                              disabled={!isEditing}
                              placeholder="Số liệu"
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                            <Input
                              value={stat.label}
                              onChange={(e) => {
                                const newStats = [...stats];
                                newStats[index].label = e.target.value;
                                setStats(newStats);
                              }}
                              disabled={!isEditing}
                              placeholder="Nhãn"
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                          </div>
                        ))}
                      </div>
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
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-slate-300">Tính năng nổi bật</label>
                      {isEditing && (
                        <Button
                          size="sm"
                          onClick={() => setAboutData({...aboutData, features: [...aboutData.features, 'Tính năng mới']})}
                          className="bg-green-500/20 border border-green-500/50 text-green-300 hover:bg-green-500/30"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Thêm
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {aboutData.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <span className="text-purple-400">🚀</span>
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
                          {isEditing && aboutData.features.length > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newFeatures = aboutData.features.filter((_, i) => i !== index);
                                setAboutData({...aboutData, features: newFeatures});
                              }}
                              className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {previewTabs.map((tab, index) => (
                      <Card key={index} className="bg-slate-700/50 border-slate-600">
                        <CardContent className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              value={tab.name}
                              onChange={(e) => {
                                const newTabs = [...previewTabs];
                                newTabs[index].name = e.target.value;
                                setPreviewTabs(newTabs);
                              }}
                              disabled={!isEditing}
                              placeholder="Tên tab"
                              className="bg-slate-600/50 border-slate-500 text-white"
                            />
                            <Input
                              value={tab.stats}
                              onChange={(e) => {
                                const newTabs = [...previewTabs];
                                newTabs[index].stats = e.target.value;
                                setPreviewTabs(newTabs);
                              }}
                              disabled={!isEditing}
                              placeholder="Thống kê"
                              className="bg-slate-600/50 border-slate-500 text-white"
                            />
                          </div>
                          <Textarea
                            value={tab.description}
                            onChange={(e) => {
                              const newTabs = [...previewTabs];
                              newTabs[index].description = e.target.value;
                              setPreviewTabs(newTabs);
                            }}
                            disabled={!isEditing}
                            rows={2}
                            placeholder="Mô tả"
                            className="bg-slate-600/50 border-slate-500 text-white"
                          />
                          <Input
                            value={tab.preview}
                            onChange={(e) => {
                              const newTabs = [...previewTabs];
                              newTabs[index].preview = e.target.value;
                              setPreviewTabs(newTabs);
                            }}
                            disabled={!isEditing}
                            placeholder="Nội dung preview"
                            className="bg-slate-600/50 border-slate-500 text-white"
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
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block">Tiêu đề chính</label>
                      <Input
                        value={aiHelperData.title}
                        onChange={(e) => setAIHelperData({...aiHelperData, title: e.target.value})}
                        disabled={!isEditing}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block">Badge subtitle</label>
                      <Input
                        value={aiHelperData.subtitle}
                        onChange={(e) => setAIHelperData({...aiHelperData, subtitle: e.target.value})}
                        disabled={!isEditing}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block">Mô tả</label>
                      <Textarea
                        value={aiHelperData.description}
                        onChange={(e) => setAIHelperData({...aiHelperData, description: e.target.value})}
                        disabled={!isEditing}
                        rows={3}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block">Text nút CTA</label>
                      <Input
                        value={aiHelperData.buttonText}
                        onChange={(e) => setAIHelperData({...aiHelperData, buttonText: e.target.value})}
                        disabled={!isEditing}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-slate-300">Demo Messages</label>
                      {isEditing && (
                        <Button
                          size="sm"
                          onClick={() => setAIHelperData({
                            ...aiHelperData, 
                            demoMessages: [...aiHelperData.demoMessages, { question: 'Câu hỏi mới?', answer: 'Câu trả lời mới...' }]
                          })}
                          className="bg-green-500/20 border border-green-500/50 text-green-300 hover:bg-green-500/30"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Thêm
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {aiHelperData.demoMessages.map((message, index) => (
                        <Card key={index} className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <span className="text-sm font-medium text-purple-300">Demo {index + 1}</span>
                              {isEditing && aiHelperData.demoMessages.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const newMessages = aiHelperData.demoMessages.filter((_, i) => i !== index);
                                    setAIHelperData({...aiHelperData, demoMessages: newMessages});
                                  }}
                                  className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Câu hỏi:</label>
                              <Input
                                value={message.question}
                                onChange={(e) => {
                                  const newMessages = [...aiHelperData.demoMessages];
                                  newMessages[index].question = e.target.value;
                                  setAIHelperData({...aiHelperData, demoMessages: newMessages});
                                }}
                                disabled={!isEditing}
                                className="bg-slate-600/50 border-slate-500 text-white text-sm mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Câu trả lời:</label>
                              <Textarea
                                value={message.answer}
                                onChange={(e) => {
                                  const newMessages = [...aiHelperData.demoMessages];
                                  newMessages[index].answer = e.target.value;
                                  setAIHelperData({...aiHelperData, demoMessages: newMessages});
                                }}
                                disabled={!isEditing}
                                rows={2}
                                className="bg-slate-600/50 border-slate-500 text-white text-sm mt-1"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Monitor className="w-5 h-5 text-purple-400" />
                <span>Preview Real-time</span>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] border border-slate-600 rounded-lg overflow-hidden">
                <LandingPagePreview
                  heroData={heroData}
                  aboutData={aboutData}
                  stats={stats}
                  previewTabs={previewTabs}
                  aiHelperData={aiHelperData}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLandingPage;
