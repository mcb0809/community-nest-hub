
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
}

interface AboutData {
  title: string;
  description: string;
  features: string[];
}

interface Stat {
  number: string;
  label: string;
}

interface PreviewTab {
  name: string;
  icon: string;
  description: string;
  preview: string;
  stats: string;
}

interface AIHelperData {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  demoMessages: Array<{
    question: string;
    answer: string;
  }>;
}

interface LandingPageData {
  hero: HeroData;
  about: AboutData;
  stats: Stat[];
  previewTabs: PreviewTab[];
  aiHelper: AIHelperData;
}

interface LandingPageContextType {
  data: LandingPageData;
  updateHero: (heroData: HeroData) => void;
  updateAbout: (aboutData: AboutData) => void;
  updateStats: (stats: Stat[]) => void;
  updatePreviewTabs: (tabs: PreviewTab[]) => void;
  updateAIHelper: (aiHelper: AIHelperData) => void;
}

const defaultData: LandingPageData = {
  hero: {
    title: 'AI AUTOMATION CLUB Plus',
    subtitle: 'MCB AI',
    description: 'Cộng đồng tiên phong về AI, Automation & Workflow MMO\nNơi bạn có thể học – chia sẻ – kiếm tiền cùng cộng đồng',
    primaryButton: 'Tham gia cộng đồng',
    secondaryButton: 'Khám phá nội dung miễn phí'
  },
  about: {
    title: 'Cộng đồng tiên phong về AI',
    description: 'AI Automation Club là nơi kết nối những người đam mê tự động hóa và AI, nơi bạn có thể học – chia sẻ – kiếm tiền cùng cộng đồng.',
    features: [
      'Cập nhật kiến thức AI & Automation liên tục',
      'Khóa học miễn phí & chuyên sâu',
      'Cộng đồng thảo luận chất lượng cao',
      'Tích hợp AI Assistant cá nhân'
    ]
  },
  stats: [
    { number: '500+', label: 'Thành viên' },
    { number: '50+', label: 'Khóa học' },
    { number: '1000+', label: 'Bài viết' },
    { number: '24/7', label: 'AI Support' }
  ],
  previewTabs: [
    {
      name: 'Khóa học',
      icon: 'BookOpen',
      description: 'Từ AI cơ bản đến nâng cao',
      preview: 'Hơn 50 khóa học chất lượng cao',
      stats: '50+ khóa học'
    },
    {
      name: 'Sự kiện',
      icon: 'Calendar',
      description: 'Workshop, meetup hàng tuần',
      preview: 'Sự kiện trực tuyến và offline',
      stats: '5+ events/tháng'
    },
    {
      name: 'Bài viết',
      icon: 'FileText',
      description: 'Kiến thức và case study',
      preview: 'Cập nhật xu hướng mới nhất',
      stats: '1000+ bài viết'
    },
    {
      name: 'Thảo luận',
      icon: 'MessageCircle',
      description: 'Cộng đồng năng động',
      preview: 'Trao đổi và hỗ trợ 24/7',
      stats: '500+ thành viên'
    },
    {
      name: 'Tài liệu',
      icon: 'Folder',
      description: 'Thư viện kiến thức phong phú',
      preview: 'Templates, tools, guides',
      stats: '100+ tài liệu'
    },
    {
      name: 'Xếp hạng',
      icon: 'Trophy',
      description: 'Hệ thống điểm và level',
      preview: 'Thi đua học tập tích cực',
      stats: 'Top 100 learners'
    }
  ],
  aiHelper: {
    title: 'Trợ lý AI đang hoạt động',
    subtitle: 'AI Assistant Beta',
    description: 'Được hỗ trợ bởi GPT-4 và được training chuyên sâu về AI & Automation',
    buttonText: 'Thử ngay AI Assistant',
    demoMessages: [
      {
        question: "Làm thế nào để tạo chatbot AI cho business?",
        answer: "Tôi có thể hướng dẫn bạn từng bước: 1) Xác định mục đích chatbot, 2) Chọn platform phù hợp, 3) Thiết kế conversation flow..."
      },
      {
        question: "Tool nào tốt nhất để automation email marketing?",
        answer: "Dựa vào nhu cầu của bạn, tôi recommend: Zapier + Mailchimp cho beginners, hoặc Make.com + ActiveCampaign cho advanced users..."
      },
      {
        question: "Cách optimize prompt để có kết quả AI tốt hơn?",
        answer: "Secrets của prompt engineering: 1) Specific instructions, 2) Context examples, 3) Output format specification..."
      }
    ]
  }
};

const LandingPageContext = createContext<LandingPageContextType | undefined>(undefined);

export const LandingPageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<LandingPageData>(defaultData);

  const updateHero = (heroData: HeroData) => {
    setData(prev => ({ ...prev, hero: heroData }));
  };

  const updateAbout = (aboutData: AboutData) => {
    setData(prev => ({ ...prev, about: aboutData }));
  };

  const updateStats = (stats: Stat[]) => {
    setData(prev => ({ ...prev, stats }));
  };

  const updatePreviewTabs = (tabs: PreviewTab[]) => {
    setData(prev => ({ ...prev, previewTabs: tabs }));
  };

  const updateAIHelper = (aiHelper: AIHelperData) => {
    setData(prev => ({ ...prev, aiHelper }));
  };

  return (
    <LandingPageContext.Provider
      value={{
        data,
        updateHero,
        updateAbout,
        updateStats,
        updatePreviewTabs,
        updateAIHelper
      }}
    >
      {children}
    </LandingPageContext.Provider>
  );
};

export const useLandingPage = () => {
  const context = useContext(LandingPageContext);
  if (context === undefined) {
    throw new Error('useLandingPage must be used within a LandingPageProvider');
  }
  return context;
};
