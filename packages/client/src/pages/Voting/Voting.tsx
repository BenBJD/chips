import useWebSocket from "react-use-websocket"
import { GameState, Message } from "../../types"

interface VotingProps {
  gameState: GameState
  playerId: number
}

const Voting = ({ gameState, playerId }: VotingProps) => {
  const { sendJsonMessage } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URL, {
    share: true,
  })

  const handleVote = (playerId: number) => {
    sendJsonMessage({ type: "vote", data: playerId } as Message)
  }

  if (gameState.currentPlayer !== playerId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-gray-500">
          It is not your turn to vote
        </h1>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Vote for the winner</h1>
        <div className="grid grid-cols-1 gap-4">
          {gameState.players.map((player) => (
            <button
              key={player.id}
              onClick={() => handleVote(player.id)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold font-xl py-2 px-4 rounded"
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>
    )
  }
}

export default Voting
