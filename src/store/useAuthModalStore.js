import { create } from "zustand";

export const useAuthModalStore = create((set) => ({
  isOpen: false,
  actionText: "access playlists & saved songs",
  openAuthModal: (actionText = "access playlists & saved songs") =>
    set({ isOpen: true, actionText }),
  closeAuthModal: () => set({ isOpen: false }),
}));
