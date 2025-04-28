import { create } from 'zustand';
import { Game } from '../../../server/src/game/Game';

interface GameStoreState {
    isConnected: boolean;
    currentGame: Game | null;
    myPlayerId: string | null;
    playerName: string | null;
    isNameSet: boolean;
    setConnected: (status: boolean) => void;
    setCurrentGame: (state: Game | null) => void;
    setMyPlayerId: (id: string | undefined) => void;
    setPlayerName: (name: string) => void;
    setIsNameSet: (status: boolean) => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
    isConnected: false,
    currentGame: null,
    myPlayerId: null,
    playerName: null,
    isNameSet: false,
    setConnected: (status) => set({ isConnected: status }),
    setCurrentGame: (state) => set({ currentGame: state }),
    setMyPlayerId: (id) => set({ myPlayerId: id }),
    setPlayerName: (name) => set({ playerName: name }),
    setIsNameSet: (status) => set({ isNameSet: status })
}));