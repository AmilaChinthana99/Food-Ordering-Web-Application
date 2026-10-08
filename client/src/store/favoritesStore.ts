import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  favoriteRestaurantIds: string[];
  favoriteMenuItemIds: string[];
  toggleRestaurant: (id: string) => void;
  toggleMenuItem: (id: string) => void;
  isRestaurantFavorite: (id: string) => boolean;
  isMenuItemFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteRestaurantIds: [],
      favoriteMenuItemIds: [],

      toggleRestaurant: (id) => {
        const { favoriteRestaurantIds } = get();
        if (favoriteRestaurantIds.includes(id)) {
          set({ favoriteRestaurantIds: favoriteRestaurantIds.filter((r) => r !== id) });
        } else {
          set({ favoriteRestaurantIds: [...favoriteRestaurantIds, id] });
        }
      },

      toggleMenuItem: (id) => {
        const { favoriteMenuItemIds } = get();
        if (favoriteMenuItemIds.includes(id)) {
          set({ favoriteMenuItemIds: favoriteMenuItemIds.filter((m) => m !== id) });
        } else {
          set({ favoriteMenuItemIds: [...favoriteMenuItemIds, id] });
        }
      },

      isRestaurantFavorite: (id) => get().favoriteRestaurantIds.includes(id),
      isMenuItemFavorite: (id) => get().favoriteMenuItemIds.includes(id),
    }),
    { name: 'foodie_favorites_storage' }
  )
);
