'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
  description?: string;
}

const FAQSection = ({ 
  items, 
  title = "자주 묻는 질문", 
  description = "영양제 배송 관리 시스템에 대해 자주 묻는 질문들입니다."
}: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category || '기타')))];
  
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => (item.category || '기타') === selectedCategory);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
          <HelpCircle className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-lg text-gray-600">{description}</p>
      </div>

      {/* Category Filter */}
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                selectedCategory === category
                  ? "bg-indigo-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {category === 'all' ? '전체' : category}
            </button>
          ))}
        </div>
      )}

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredItems.map((item, index) => (
          <div
            key={index}
            className={cn(
              "bg-white rounded-lg shadow-sm border transition-all duration-200",
              openIndex === index ? "border-indigo-200 shadow-md" : "border-gray-200 hover:border-gray-300"
            )}
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg"
            >
              <span className="font-medium text-gray-900 pr-8">{item.question}</span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0",
                  openIndex === index && "transform rotate-180 text-indigo-600"
                )}
              />
            </button>
            
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                openIndex === index ? "max-h-96" : "max-h-0"
              )}
            >
              <div className="px-6 pb-4">
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 text-center p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          더 많은 도움이 필요하신가요?
        </h3>
        <p className="text-gray-600 mb-4">
          고객 지원팀이 언제든지 도와드릴 준비가 되어 있습니다.
        </p>
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
          문의하기
        </button>
      </div>
    </div>
  );
};

export default FAQSection;