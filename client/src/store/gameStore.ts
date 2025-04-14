import { create } from 'zustand';
import { Game } from '../../../server/src/game/types';

interface GameStoreState {
    isConnected: boolean;
    gameState: Game | null;
    myPlayerId: string | null;
    setConnected: (status: boolean) => void;
    setGameState: (state: Game | null) => void;
    setMyPlayerId: (id: string | undefined) => void;    
}

export const useGameStore = create<GameStoreState>((set) => ({
    isConnected: false,
    gameState: null,
    myPlayerId: null,
    setConnected: (status) => set({ isConnected: status }),
    setGameState: (state) => set({ gameState: state }),
    setMyPlayerId: (id) => set({ myPlayerId: id }),
}));