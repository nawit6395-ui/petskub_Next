import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@shared/integrations/supabase/client';
import { alert } from '@shared/lib/alerts';

export interface Cat {
  id: string;
  name: string;
  age: string;
  gender: 'ชาย' | 'หญิง' | 'ไม่ระบุ';
  province: string;
  district: string | null;
  image_url: string[] | null;
  story: string | null;
  health_status: string | null;
  is_sterilized: boolean;
  is_adopted: boolean;
  is_urgent: boolean;
  contact_name: string;
  contact_phone: string;
  contact_line: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  views?: number; // Added views property
}

export const useCats = () => {
  return useQuery({
    queryKey: ['cats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Cat[];
    },
    staleTime: 1000 * 60 * 5,
    select: (data) => data ?? [],
    placeholderData: (prev) => prev,
  });
};

export const useCreateCat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cat: Omit<Cat, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('cats')
        .insert(cat)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cats'] });
      alert.success('เพิ่มข้อมูลสัตว์เลี้ยงสำเร็จ');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      alert.error('เกิดข้อผิดพลาด', {
        description: error.message
      });
    },
  });
};

export const useUpdateCat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cat> & { id: string }) => {
      const { data, error } = await supabase
        .from('cats')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cats'] });
      alert.success('อัพเดทข้อมูลสำเร็จ');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      alert.error('เกิดข้อผิดพลาด', {
        description: error.message
      });
    },
  });
};

export const useDeleteCat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cats').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cats'] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      alert.error('ลบข้อมูลไม่สำเร็จ', {
        description: error.message,
      });
    },
  });
};
