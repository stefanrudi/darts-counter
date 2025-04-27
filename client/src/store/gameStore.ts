import { create } from 'zustand';
import { Game } from '../../../server/src/game/Game';

interface GameStoreState {
    isConnected: boolean;
    currentGame: Game | null;
    myPlayerId: string | null;
    setConnected: (status: boolean) => void;
    setCurrentGame: (state: Game | null) => void;
    setMyPlayerId: (id: string | undefined) => void;    
}

export const useGameStore = create<GameStoreState>((set) => ({
    isConnected: false,
    currentGame: null,
    myPlayerId: null,
    setConnected: (status) => set({ isConnected: status }),
    setCurrentGame: (state) => set({ currentGame: state }),
    setMyPlayerId: (id) => set({ myPlayerId: id }),
}));