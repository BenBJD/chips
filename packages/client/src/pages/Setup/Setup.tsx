import useWebSocket from "react-use-websocket"
import { Message } from "../../types.ts"

interface SetupProps {
  playerId: number | null
}

const Setup = ({ playerId }: SetupProps) => {
  const { sendJsonMessage } = useWebSocket("ws://localhost:8080", {
    share: true,
  })

  const handleJoin = () => {
    sendJsonMessage({ type: "join" } as Message)
  }

  if (playerId !== null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">You are Player {playerId}</h2>
        <button
          onClick={() => sendJsonMessage({ type: "start" } as Message)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Everyone Connected? Start Game
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={handleJoin}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Join Game
      </button>
    </div>
  )
}

export default Setup
