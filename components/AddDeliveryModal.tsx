'use client';

import { useState, useRef, useEffect } from 'react';
import { addDelivery } from '@/app/actions';

interface AddDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDeliveryModal({ isOpen, onClose, onSuccess }: AddDeliveryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      formRef.current?.reset();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
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
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            새 배송 추가
          </h3>
          
          {error && (
            <div className="mt-2 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <form ref={formRef} onSubmit={handleSubmit} className="mt-4">
            <div className="mb-4">
              <label htmlFor="recipient_name" className="block text-sm font-medium text-gray-700">
                수령인 이름 *
              </label>
              <input
                type="text"
                name="recipient_name"
                id="recipient_name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="supplement_type" className="block text-sm font-medium text-gray-700">
                영양제 종류 *
              </label>
              <input
                type="text"
                name="supplement_type"
                id="supplement_type"
                required
                placeholder="예: 비타민C, 오메가3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                수량 *
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                required
                min="1"
                defaultValue="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700">
                배송 예정일 *
              </label>
              <input
                type="date"
                name="delivery_date"
                id="delivery_date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700">
                송장번호 (선택사항)
              </label>
              <input
                type="text"
                name="invoice_number"
                id="invoice_number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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