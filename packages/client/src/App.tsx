import { useEffect, useState } from "react"
import useWebSocket from "react-use-websocket"
import Setup from "./pages/Setup/Setup.tsx"
import { GameState, WebSocketResponse } from "./types.ts"
import Betting from "./pages/Betting/Betting.tsx"
import Voting from "./pages/Voting/Voting.tsx"
import CardFlipping from "./pages/CardFlipping/CardFlipping.tsx"

function App() {
  const { lastJsonMessage } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URL, {
    share: true,
  })

  const [gameState, setGameState] = useState({} as GameState)

  const [playerId, setPlayerId] = useState<number | null>(null)

  // Retrieve player ID from session storage
  useEffect(() => {
    const storedPlayerId = sessionStorage.getItem("playerId")
    if (storedPlayerId !== null) {
      setPlayerId(parseInt(storedPlayerId))
    }
  }, [])

  // Listen for game state changes
  useEffect(() => {
    console.log(lastJsonMessage)
    if (lastJsonMessage !== null) {
      setGameState((lastJsonMessage as WebSocketResponse).gameState)
      console.log(gameState)
      if ((lastJsonMessage as WebSocketResponse).playerId !== null) {
        setPlayerId((lastJsonMessage as WebSocketResponse).playerId as number)
        // Save player ID to session storage
        sessionStorage.setItem(
          "playerId",
          (
            (lastJsonMessage as WebSocketResponse).playerId as number
          ).toString(),
        )
      }
    }
  }, [lastJsonMessage])

  if (
    playerId === null ||
    gameState.state === "setup" ||
    lastJsonMessage === null
  ) {
    return <Setup playerId={playerId} />
  }

  if (gameState.state === "betting") {
    return <Betting gameState={gameState} playerId={playerId} />
  }

  if (gameState.state === "voting") {
    return <Voting gameState={gameState} playerId={playerId} />
  }

  if (gameState.state === "cardFlipping") {
    return <CardFlipping />
  }

  return <p>Limbo?</p>
}

export default App
