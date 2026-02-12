import { useState, useEffect } from 'react';
import { alert } from '@/lib/alerts';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        // Load favorites from local storage on mount
        const storedFavorites = localStorage.getItem('petskub_favorites');
        if (storedFavorites) {
            try {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                setFavorites(JSON.parse(storedFavorites));
            } catch (e) {
                console.error('Failed to parse favorites from local storage', e);
            }
        }
    }, []);

    const toggleFavorite = (id: string, name: string) => {
        setFavorites((prev) => {
            const isFavorite = prev.includes(id);
            const newFavorites = isFavorite
                ? prev.filter((favId) => favId !== id)
                : [...prev, id];

            localStorage.setItem('petskub_favorites', JSON.stringify(newFavorites));

            if (!isFavorite) {
                alert.success('บันทึกรายการโปรดแล้ว', {
                    description: `คุณสามารถดู ${name} ได้ในรายการโปรดของคุณ`
                });
            } else {
                alert.success('ลบออกจากรายการโปรดแล้ว');
            }

            return newFavorites;
        });
    };

    const isFavorite = (id: string) => favorites.includes(id);

    return { favorites, toggleFavorite, isFavorite };
};
