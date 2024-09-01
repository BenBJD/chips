import useWebSocket from "react-use-websocket"
import { Message } from "../../types.ts"

interface SetupProps {
  playerId: number | null
}

const Setup = ({ playerId }: SetupProps) => {
  const { sendJsonMessage } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URL, {
    share: true,
  })

  const handleJoin = () => {
    sendJsonMessage({ type: "join" } as Message)
  }

  if (playerId !== null) {
    return (
      <div className="flex text-white flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">You are Player {playerId}</h2>
        <button
          onClick={() => sendJsonMessage({ type: "start" } as Message)}
          className="bg-green-500 hover:bg-green-700 text-white text-3xl font-bold py-2 px-4 m-6 rounded"
        >
          Everyone Connected? <br /> Start Game
        </button>
      </div>
    )
  }

  return (
    <div className="flex text-white flex-col items-center justify-center h-screen">
      <button
        onClick={handleJoin}
        className="bg-blue-500 hover:bg-blue-700 text-white text-4xl font-bold py-4 px-6 rounded"
      >
        Join Game
      </button>
    </div>
  )
}

export default Setup
