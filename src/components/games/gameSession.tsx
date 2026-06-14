import { createContext, useContext } from "react";

export interface GameSessionContextValue {
  reportMistake: () => void;
}

export const GameSessionContext = createContext<GameSessionContextValue>({
  reportMistake: () => {},
});

export const useGameSession = () => useContext(GameSessionContext);