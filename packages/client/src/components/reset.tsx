import useWebSocket from "react-use-websocket"
import { Message } from "../types.ts"

const ResetButton = () => {
  const { sendJsonMessage } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URL, {
    share: true,
  })

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the game?")) {
      localStorage.clear()
      sendJsonMessage({ type: "end" } as Message)
    }
  }

  return (
    <button
      onClick={handleReset}
      className="bg-red-500 hover:bg-red-700 text-white fixed m-2 font-bold py-2 px-2 rounded"
    >
      End Game
    </button>
  )
}

export default ResetButton
