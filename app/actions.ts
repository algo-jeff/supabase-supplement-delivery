'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function addDelivery(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('supplement_delivery')
    .update({ is_send })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update delivery status: ${error.message}`);
  }

  revalidatePath('/');
}