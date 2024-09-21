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
    <div className="flex flex-col text-white items-center justify-center h-screen space-y-6">
      <h3 className="text-4xl font-bold mb-10">Flip a Card</h3>
      <button
        onClick={handleNextRound}
        className="bg-blue-500 hover:bg-blue-700 text-white text-2xl font-bold py-4 px-6 rounded"
      >
        Restart Betting
      </button>
      <button
        onClick={handleEndGame}
        className="bg-red-500 hover:bg-red-700 text-white text-2xl font-bold py-4 px-6 rounded"
      >
        Finish Game
      </button>
    </div>
  )
}

export default CardFlipping
