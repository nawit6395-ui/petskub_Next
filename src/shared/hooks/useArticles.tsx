import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@shared/integrations/supabase/client';
import { alert } from '@shared/lib/alerts';

export interface Article {
  id: string;
  slug?: string | null;
  title: string;
  meta_title?: string;
  meta_description?: string;
  content: string;
  category: string;
  image_url?: string;
  image_alt?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  keywords?: string[];
  author_id: string;
  published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export const useArticle = (idOrSlug: string | undefined) => {
  return useQuery({
    queryKey: ['knowledge_article', idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) throw new Error('Article ID or Slug is required');

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

      let query = supabase
        .from('knowledge_articles')
        .select('*')
        .eq('published', true);

      if (isUUID) {
        query = query.eq('id', idOrSlug);
      } else {
        query = query.eq('slug', idOrSlug);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return data as Article;
    },
    enabled: !!idOrSlug,
  });
};

export const useArticles = () => {
  return useQuery({
    queryKey: ['knowledge_articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Article[];
    },
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views'>) => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .insert(article)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge_articles'] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      alert.error('เกิดข้อผิดพลาด', {
        description: error.message
      });
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...article }: { id: string } & Partial<Article>) => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .update(article)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Article;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge_articles'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge_article', variables.id] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      alert.error('เกิดข้อผิดพลาด', {
        description: error.message,
      });
    },
  });
};

export const useIncrementArticleView = () => {
  return useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase.rpc('increment_article_views', {
        article_id: articleId,
      });

      if (error) throw error;
    },
    // We intentionally don't invalidate queries here to avoid refetching the whole article just for a +1 view count update,
    // which would cause a visible flash or re-render. The view count is eventual consistency anyway.
    // If real-time update is needed, we can invalidate 'knowledge_article'.
    console.error('Failed to increment view count:', error);
  },
  });
};

export const useCheckSlugAvailability = () => {
  return useMutation({
    mutationFn: async ({ slug, excludeId }: { slug: string; excludeId?: string }) => {
      let query = supabase
        .from('knowledge_articles')
        .select('*', { count: 'exact', head: true })
        .eq('slug', slug);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count ? count > 0 : false;
    },
  });
};
