'use client';

import FAQSection from '@/components/ui/faq-section';
import AnimatedNavbar from '@/components/ui/animated-navbar';
import Sidebar from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { getSession, logout } from '../actions';

const faqItems = [
  {
    question: "영양제 배송 관리 시스템은 어떤 기능을 제공하나요?",
    answer: "영양제 배송 관리 시스템은 영양제 배송 정보를 체계적으로 관리할 수 있는 다양한 기능을 제공합니다. 배송 정보 추가, 수정, 삭제는 물론 배송 상태 관리, 검색 및 필터링, 데이터 정렬 등의 기능을 사용할 수 있습니다.",
    category: "기본 기능"
  },
  {
    question: "배송 상태는 어떻게 변경하나요?",
    answer: "각 배송 항목의 상태 토글 버튼을 클릭하면 배송 대기와 배송 완료 상태를 즉시 변경할 수 있습니다. 변경 사항은 실시간으로 데이터베이스에 저장됩니다.",
    category: "기본 기능"
  },
  {
    question: "데이터를 필터링하는 방법은 무엇인가요?",
    answer: "고급 필터 기능을 통해 배송 상태, 영양제 종류, 날짜 범위 등 다양한 조건으로 데이터를 필터링할 수 있습니다. 검색창을 통해 수령인 이름, 영양제 종류, 송장번호로도 검색이 가능합니다.",
    category: "검색 및 필터"
  },
  {
    question: "데이터는 어디에 저장되나요?",
    answer: "모든 배송 데이터는 Supabase 클라우드 데이터베이스에 안전하게 저장됩니다. 실시간 동기화를 지원하여 여러 사용자가 동시에 사용해도 데이터가 항상 최신 상태로 유지됩니다.",
    category: "데이터 관리"
  },
  {
    question: "모바일에서도 사용할 수 있나요?",
    answer: "네, 반응형 디자인이 적용되어 있어 PC, 태블릿, 스마트폰 등 다양한 기기에서 최적화된 화면으로 사용할 수 있습니다.",
    category: "접근성"
  },
  {
    question: "데이터를 백업할 수 있나요?",
    answer: "현재 버전에서는 직접적인 백업 기능은 제공하지 않지만, Supabase 대시보드를 통해 데이터를 CSV 형식으로 내보낼 수 있습니다.",
    category: "데이터 관리"
  },
  {
    question: "여러 사용자가 동시에 사용할 수 있나요?",
    answer: "네, 여러 사용자가 동시에 접속하여 사용할 수 있습니다. 실시간 데이터 동기화를 통해 모든 사용자가 항상 최신 데이터를 볼 수 있습니다.",
    category: "접근성"
  },
  {
    question: "권한 설정은 어떻게 하나요?",
    answer: "현재는 기본적인 인증 기능만 제공하고 있습니다. 상세한 권한 관리 기능은 추후 업데이트를 통해 제공될 예정입니다.",
    category: "보안"
  }
];

export default function FAQPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        setUserEmail(session.email);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userEmail={userEmail} onLogout={handleLogout} />
      
      <div className="md:ml-64 transition-all duration-300">
        <AnimatedNavbar 
          userEmail={userEmail} 
          onLogout={handleLogout}
        />
        
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-10">
          <FAQSection 
            items={faqItems}
            title="자주 묻는 질문"
            description="영양제 배송 관리 시스템에 대해 자주 묻는 질문들입니다."
          />
        </main>
      </div>
    </div>
  );
}