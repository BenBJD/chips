export type Player = {
  id: number
  name: string
  balance: number
  bet: number
  status: "active" | "folded"
  winVote: number
}
export type GameState = {
  state: "setup" | "betting" | "voting" | "cardFlipping"
  startPlayer: number
  lastPlayer: number
  currentVoter: number
  currentPlayer: number
  minimumBet: number
  startingBalance: number
  chipValues: [number, number, number, number, number]
  players: Player[]
  game: number
}

export type Message = {
  type:
    | "join"
    | "start"
    | "bet"
    | "vote"
    | "startVote"
    | "cardFlipping"
    | "end"
    | "resumeBetting"
  data: any
}

export type WebSocketResponse = {
  playerId: number | null
  gameState: GameState
}
