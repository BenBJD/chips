import useWebSocket from "react-use-websocket"
import { Message } from "../../types"

const CardFlipping = () => {
  const { sendJsonMessage } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URL, {
    share: true,
  })

  const handleNextRound = () => {
    sendJsonMessage({ type: "resumeBetting" } as Message)
  }

  const handleEndGame = () => {
    sendJsonMessage({ type: "startVote" } as Message)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={handleNextRound}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Go to next round
      </button>
      <button
        onClick={handleEndGame}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        End game
      </button>
    </div>
  )
}

export default CardFlipping
