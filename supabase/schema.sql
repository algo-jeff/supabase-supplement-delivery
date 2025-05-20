-- Supabase 스키마 파일
-- Supabase Studio에서 이 SQL을 실행하여 테이블을 생성하세요

-- supplement_delivery 테이블 생성
CREATE TABLE IF NOT EXISTS supplement_delivery (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  supplement_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  delivery_status TEXT NOT NULL,
  tracking_number TEXT,
  notes TEXT
);

-- 테이블에 대한 RLS(Row Level Security) 활성화
ALTER TABLE supplement_delivery ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 읽기 권한 부여하는 RLS 정책 추가
CREATE POLICY "Enable read access for all users" ON supplement_delivery 
FOR SELECT USING (true);

-- 샘플 데이터 삽입
INSERT INTO supplement_delivery 
  (name, email, address, supplement_name, quantity, delivery_status, tracking_number, notes) 
VALUES 
  ('김지원', 'jiwon@example.com', '서울시 강남구 테헤란로 123', '비타민 D3', 2, 'delivered', 'TRK12345', '정시 배송 완료'),
  ('이민수', 'minsoo@example.com', '경기도 성남시 분당구 판교로 45', '오메가-3', 1, 'in_transit', 'TRK67890', '2일 내 배송 예정'),
  ('박서연', 'seoyeon@example.com', '서울시 마포구 홍대입구로 55', '아연 보충제', 3, 'pending', NULL, '주문 처리 중');