import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { GameAction, GameState } from '../types';
import { gameReducer } from './gameReducer';
import { clearSave, loadGame, saveGame } from '../services/persistence';

interface GameContextValue {
    game: GameState | null;
    dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue>({ game: null, dispatch: () => {} });

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
    const [game, dispatch] = useReducer(gameReducer, null, loadGame);

    useEffect(() => {
        if (game) saveGame(game);
        else clearSave();
    }, [game]);

    return <GameContext.Provider value={{ game, dispatch }}>{children}</GameContext.Provider>;
};

export const useGame = () => useContext(GameContext);

// Para páginas que solo tienen sentido con partida activa (protegidas por RequireGame).
export const useActiveGame = () => {
    const { game, dispatch } = useContext(GameContext);
    if (!game) throw new Error('useActiveGame usado sin partida activa');
    return { game, dispatch };
};
