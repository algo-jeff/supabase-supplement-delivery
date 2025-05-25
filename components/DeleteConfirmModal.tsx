'use client';

import { useState } from 'react';
import { deleteDelivery } from '@/app/actions';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  deliveryId: number | null;
  recipientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmModal({ 
  isOpen, 
  deliveryId, 
  recipientName, 
  onClose, 
  onSuccess 
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deliveryId) return;
    
    setIsDeleting(true);
    setError(null);

    try {
      await deleteDelivery(deliveryId);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !deliveryId) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              배송 삭제 확인
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{recipientName}</span>님의 배송 정보를 삭제하시겠습니까?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mt-3 bg-red-50 border-l-4 border-red-400 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="mt-5 flex justify-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}