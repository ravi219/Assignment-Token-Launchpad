import { create } from "zustand";

interface UIStore {
  // Mobile Sidebar State
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;

  // Global Transaction Overlay (useful for blocking UI during critical txs)
  isGlobalOverlayActive: boolean;
  overlayMessage: string | null;
  showOverlay: (message: string) => void;
  hideOverlay: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Sidebar
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),

  // Overlay
  isGlobalOverlayActive: false,
  overlayMessage: null,
  showOverlay: (message) => set({ isGlobalOverlayActive: true, overlayMessage: message }),
  hideOverlay: () => set({ isGlobalOverlayActive: false, overlayMessage: null }),
}));