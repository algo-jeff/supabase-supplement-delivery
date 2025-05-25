'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// 허용된 계정 정보
const ALLOWED_ACCOUNTS = [
  { email: 'postman@algocare.me', password: 'post1234' }
];

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // 허용된 계정인지 확인
  const isAllowed = ALLOWED_ACCOUNTS.some(
    account => account.email === email && account.password === password
  );

  if (!isAllowed) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  // 간단한 세션 쿠키 설정
  const cookieStore = await cookies();
  cookieStore.set('auth-session', JSON.stringify({ email, authenticated: true }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7일
  });

  revalidatePath('/');
  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-session');
  redirect('/login');
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth-session');
  
  if (!session) {
    return null;
  }

  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function addDelivery(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const delivery = {
    recipient_name: formData.get('recipient_name') as string,
    supplement_type: formData.get('supplement_type') as string,
    quantity: parseInt(formData.get('quantity') as string),
    delivery_date: formData.get('delivery_date') as string,
    invoice_number: formData.get('invoice_number') as string || null,
    is_send: false
  };

  const { error } = await supabase
    .from('supplement_delivery')
    .insert([delivery]);

  if (error) {
    throw new Error(`Failed to add delivery: ${error.message}`);
  }

  revalidatePath('/');
}

export async function deleteDelivery(id: number) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('supplement_delivery')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete delivery: ${error.message}`);
  }

  revalidatePath('/');
}

export async function updateDeliveryStatus(id: number, is_send: boolean) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('supplement_delivery')
    .update({ is_send })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update delivery status: ${error.message}`);
  }

  revalidatePath('/');
}