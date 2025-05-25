'use client';

import { useState, useRef, useEffect } from 'react';
import { addDelivery } from '@/app/actions';

interface AddDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// 영양제 종류 옵션들
const SUPPLEMENT_OPTIONS = [
  '비타민C',
  '비타민D',
  '비타민E',
  '비타민B컴플렉스',
  '오메가3',
  '마그네슘',
  '칼슘',
  '철분',
  '아연',
  '프로바이오틱스',
  '코엔자임Q10',
  '글루코사민',
  '콜라겐',
  '루테인',
  '밀크시슬',
  '종합비타민',
  '기타'
];

export default function AddDeliveryModal({ isOpen, onClose, onSuccess }: AddDeliveryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);
  const [customSupplement, setCustomSupplement] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSelectedSupplements([]);
      setCustomSupplement('');
      setShowCustomInput(false);
      formRef.current?.reset();
    }
  }, [isOpen]);

  const handleSupplementToggle = (supplement: string) => {
    if (supplement === '기타') {
      setShowCustomInput(!showCustomInput);
      if (showCustomInput) {
        setCustomSupplement('');
        setSelectedSupplements(prev => prev.filter(s => s !== customSupplement));
      }
      return;
    }

    setSelectedSupplements(prev => {
      if (prev.includes(supplement)) {
        return prev.filter(s => s !== supplement);
      } else {
        return [...prev, supplement];
      }
    });
  };

  const handleCustomSupplementChange = (value: string) => {
    setCustomSupplement(value);
    if (value.trim()) {
      setSelectedSupplements(prev => {
        const filtered = prev.filter(s => !prev.some(p => p.startsWith('기타:')));
        return [...filtered, `기타: ${value.trim()}`];
      });
    } else {
      setSelectedSupplements(prev => prev.filter(s => !s.startsWith('기타:')));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (selectedSupplements.length === 0) {
      setError('영양제 종류를 하나 이상 선택해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);
      // 선택된 영양제들을 문자열로 합쳐서 전송
      formData.set('supplement_type', selectedSupplements.join(', '));
      await addDelivery(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '배송 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border max-w-md shadow-xl rounded-xl bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-bold text-gray-900 mb-4">
            새 배송 추가
          </h3>
          
          {error && (
            <div className="mt-2 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="recipient_name" className="block text-sm font-medium text-gray-700 mb-1">
                수령인 이름 *
              </label>
              <input
                type="text"
                name="recipient_name"
                id="recipient_name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="수령인 이름을 입력하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                영양제 종류 * (다중 선택 가능)
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {SUPPLEMENT_OPTIONS.map((supplement) => (
                    <label
                      key={supplement}
                      className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                        selectedSupplements.includes(supplement) || 
                        (supplement === '기타' && showCustomInput)
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedSupplements.includes(supplement) || 
                          (supplement === '기타' && showCustomInput)
                        }
                        onChange={() => handleSupplementToggle(supplement)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm">{supplement}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {showCustomInput && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customSupplement}
                    onChange={(e) => handleCustomSupplementChange(e.target.value)}
                    placeholder="기타 영양제 이름을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
              
              {selectedSupplements.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">선택된 영양제:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSupplements.map((supplement, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {supplement}
                        <button
                          type="button"
                          onClick={() => {
                            if (supplement.startsWith('기타:')) {
                              setCustomSupplement('');
                              setShowCustomInput(false);
                            }
                            setSelectedSupplements(prev => prev.filter(s => s !== supplement));
                          }}
                          className="ml-1 text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                수량 *
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                required
                min="1"
                defaultValue="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="수량"
              />
            </div>
            
            <div>
              <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
                배송 예정일 *
              </label>
              <input
                type="date"
                name="delivery_date"
                id="delivery_date"
                required
                defaultValue={getTodayDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            
            <div>
              <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700 mb-1">
                송장번호 (선택사항)
              </label>
              <input
                type="text"
                name="invoice_number"
                id="invoice_number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="송장번호를 입력하세요"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedSupplements.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg"
              >
                {isSubmitting ? '추가 중...' : '추가'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}