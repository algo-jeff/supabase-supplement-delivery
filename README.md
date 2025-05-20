# Supabase 영양제 배송 추적기

Supabase의 `supplement_delivery` 테이블 데이터를 표시하는 Next.js 애플리케이션입니다. 이 프로젝트는 Vercel에 쉽게 배포할 수 있도록 설계되었습니다.

## 주요 기능

- 영양제 배송 정보 표시
- Supabase의 실시간 데이터
- Tailwind CSS를 사용한 반응형 디자인
- Vercel 간편 배포

## 사전 준비사항

시작하기 전에 Supabase 프로젝트를 설정해야 합니다:

1. 계정이 없는 경우 [supabase.com](https://supabase.com)에서 Supabase 계정을 만듭니다
2. 새 Supabase 프로젝트를 생성합니다
3. Supabase 프로젝트에서 다음 스키마로 `supplement_delivery` 테이블을 생성합니다:

```sql
CREATE TABLE supplement_delivery (
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
```

4. 샘플 데이터 삽입 (선택사항)

```sql
INSERT INTO supplement_delivery 
  (name, email, address, supplement_name, quantity, delivery_status, tracking_number, notes) 
VALUES 
  ('김지원', 'jiwon@example.com', '서울시 강남구 테헤란로 123', '비타민 D3', 2, 'delivered', 'TRK12345', '정시 배송 완료'),
  ('이민수', 'minsoo@example.com', '경기도 성남시 분당구 판교로 45', '오메가-3', 1, 'in_transit', 'TRK67890', '2일 내 배송 예정'),
  ('박서연', 'seoyeon@example.com', '서울시 마포구 홍대입구로 55', '아연 보충제', 3, 'pending', NULL, '주문 처리 중');
```

5. 프로젝트 설정에서 Supabase URL과 익명 키를 가져옵니다

## Vercel 배포 방법

### 방법 1: 원클릭 배포

Vercel에 이 프로젝트를 배포하는 가장 쉬운 방법은 아래 버튼을 클릭하는 것입니다:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Falgo-jeff%2Fsupabase-supplement-delivery)

### 방법 2: 수동 가져오기

1. [vercel.com](https://vercel.com)으로 이동합니다
2. "Add New" > "Project"를 클릭합니다
3. "Import Git Repository"를 선택합니다
4. 이 GitHub 저장소를 선택하거나, 변경을 원하면 먼저 포크합니다
5. 설정 단계에서 다음 환경 변수를 추가합니다:
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 프로젝트 익명 키
6. "Deploy"를 클릭합니다

## 로컬 개발 환경

로컬에서 이 프로젝트를 실행하려면:

1. 저장소 클론
   ```bash
   git clone https://github.com/algo-jeff/supabase-supplement-delivery.git
   cd supabase-supplement-delivery
   ```

2. 의존성 설치
   ```bash
   npm install
   # 또는
   yarn
   # 또는
   pnpm install
   ```

3. `.env.local` 파일 생성 (`.env.example`에서 복사)하고 Supabase 자격 증명을 추가:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. 개발 서버 실행
   ```bash
   npm run dev
   # 또는
   yarn dev
   # 또는
   pnpm dev
   ```

5. 브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인합니다.

## 커스터마이징

- 테이블 스키마가 다른 경우 `utils/supabase.ts`를 수정합니다
- 데이터 표시 방식을 변경하려면 `app/page.tsx`에서 UI를 편집합니다
- 필요에 따라 더 많은 페이지나 기능을 추가합니다

## Supabase 설정 방법

제공된 Supabase 정보로 이미 환경 변수가 설정되어 있습니다. 실제 테이블을 생성하려면:

1. [Supabase 대시보드](https://app.supabase.com)에 로그인합니다.
2. 제공된 프로젝트로 이동합니다.
3. 왼쪽 메뉴에서 "SQL Editor"를 클릭합니다.
4. 이 저장소의 `supabase/schema.sql` 파일 내용을 복사하여 SQL 편집기에 붙여넣고 실행합니다.
5. 테이블이 생성되고 샘플 데이터가 삽입됩니다.
6. "Table Editor"에서 supplement_delivery 테이블을 선택하여 데이터가 제대로 들어갔는지 확인합니다.

## 더 알아보기

- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Vercel 문서](https://vercel.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)