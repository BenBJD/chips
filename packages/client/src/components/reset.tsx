import useWebSocket from "react-use-websocket"
import { Message } from "../types.ts"

const ResetButton = () => {
  const { sendJsonMessage } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URL, {
    share: true,
  })

  const handleReset = () => {
    sessionStorage.clear()
    sendJsonMessage({ type: "end" } as Message)
  }

  return (
    <button
      onClick={handleReset}
      className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-2 px-2 rounded"
    >
      Reset Game
    </button>
  )
}

export default ResetButton
