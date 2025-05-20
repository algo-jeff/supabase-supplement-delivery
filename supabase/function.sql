-- Supabase에서 실행할 함수 생성
CREATE OR REPLACE FUNCTION get_supplement_deliveries()
RETURNS SETOF supplement_delivery AS $$
  SELECT * FROM supplement_delivery
$$ LANGUAGE sql;