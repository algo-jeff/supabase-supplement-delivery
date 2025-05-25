'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    id: 1,
    question: "영양제 배송은 얼마나 걸리나요?",
    answer: "일반적으로 주문 후 2-3일 내에 배송이 완료됩니다. 배송 상황은 실시간으로 추적 가능합니다."
  },
  {
    id: 2,
    question: "배송 상태를 어떻게 확인할 수 있나요?",
    answer: "대시보드에서 실시간으로 배송 상태를 확인할 수 있습니다. 배송 완료/대기 상태가 명확히 표시됩니다."
  },
  {
    id: 3,
    question: "배송 정보를 수정할 수 있나요?",
    answer: "배송 대기 상태인 경우 수령인 정보나 배송일을 수정할 수 있습니다. 배송 완료 후에는 수정이 제한됩니다."
  },
  {
    id: 4,
    question: "송장번호는 언제 제공되나요?",
    answer: "배송이 시작되면 자동으로 송장번호가 생성되어 시스템에 등록됩니다."
  },
  {
    id: 5,
    question: "대량 주문 관리는 어떻게 하나요?",
    answer: "대시보드에서 여러 배송을 한 번에 관리할 수 있으며, 필터와 정렬 기능을 통해 효율적으로 관리 가능합니다."
  }
];

interface FAQPageProps {
  faqs?: FAQItem[];
  badge?: string;
  heading?: string;
  description?: string;
}

export default function FAQPage({
  faqs = defaultFAQs,
  badge = "FAQ",
  heading = "자주 묻는 질문",
  description = "영양제 배송 관리 시스템에 대한 자주 묻는 질문들을 확인하세요."
}: FAQPageProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 섹션 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full mb-4"
          >
            {badge}
          </motion.span>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            {heading}
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        </motion.div>

        {/* FAQ 목록 */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openItems.includes(faq.id);
            
            return (
              <motion.div
                key={faq.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-6 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {faq.id}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900">
                        {faq.question}
                      </h3>
                    </div>
                    <motion.svg
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                  </div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 ml-12">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* 추가 도움말 섹션 */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              더 궁금한 점이 있으신가요?
            </h3>
            <p className="mb-6 opacity-90">
              위에서 답을 찾지 못하셨다면 언제든지 문의해 주세요.
            </p>
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
              문의하기
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}