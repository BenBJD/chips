import { useState } from "react"
import { GameState, Message } from "../../types.ts"
import useWebSocket from "react-use-websocket"

interface BettingProps {
  gameState: GameState
  playerId: number
}

const Betting = ({ gameState, playerId }: BettingProps) => {
  const { sendJsonMessage } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URL, {
    share: true,
  })

  const playerState = gameState.players[playerId]

  const [chipCounts, setChipCounts] = useState({
    red: { value: gameState.chipValues[0], count: 0 },
    blue: { value: gameState.chipValues[1], count: 0 },
    green: { value: gameState.chipValues[2], count: 0 },
    black: { value: gameState.chipValues[3], count: 0 },
    yellow: { value: gameState.chipValues[4], count: 0 },
  })

  const [addedBet, setAddedBet] = useState(0)

  const handleFold = () => {
    sendJsonMessage({ type: "bet", data: "fold" } as Message)
  }

  const handleSubmitBet = () => {
    if (addedBet > gameState.players[playerId].balance) {
      alert("You don't have enough chips to make that bet")
      return
    }
    if (
      addedBet + playerState.bet <
        gameState.players.reduce(
          (acc, player) => Math.max(acc, player.bet),
          0,
        ) ||
      addedBet + playerState.bet < gameState.minimumBet
    ) {
      alert(
        "Your bet must be at least as high as the current highest bet or minimum bet",
      )
      return
    }
    let finalBet = addedBet
    // Reset chip counts
    setChipCounts({
      red: { value: gameState.chipValues[0], count: 0 },
      blue: { value: gameState.chipValues[1], count: 0 },
      green: { value: gameState.chipValues[2], count: 0 },
      black: { value: gameState.chipValues[3], count: 0 },
      yellow: { value: gameState.chipValues[4], count: 0 },
    })
    setAddedBet(0)
    // Submit bet
    sendJsonMessage({ type: "bet", data: finalBet } as Message)
  }

  const CalculateBet = () => {
    // Calculate value of added chips
    return Object.entries(chipCounts).reduce(
      (acc, [_, { value, count }]) => acc + value * count,
      0,
    )
  }

  const handleChipChange = (
    color: "red" | "blue" | "green" | "black" | "yellow",
    count: number,
  ) => {
    let newCount = chipCounts
    newCount[color].count += count
    setChipCounts(newCount)
    setAddedBet(CalculateBet())
  }

  if (gameState.currentPlayer !== playerId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className={"text-2xl mb-4 font-bold"}>
          Current Player: {gameState.currentPlayer}
        </h2>
        <h3 className="text-xl font-bold mb-4">
          Your Balance: {playerState.balance}
        </h3>
        <h2 className="text-2xl font-bold mb-4">
          Current Highest Bet:
          {" " +
            gameState.players.reduce(
              (acc, player) => Math.max(acc, player.bet),
              0,
            )}
        </h2>
        <h3 className="text-xl font-bold mb-4">Your Bet: {playerState.bet}</h3>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-md">
        <h2 className={"text-2xl mb-4 font-bold"}>
          You are the current Player
        </h2>
        <h2 className="text-2xl font-bold mb-4">
          Current Highest Bet:
          {" " +
            gameState.players.reduce(
              (acc, player) => Math.max(acc, player.bet),
              0,
            )}
        </h2>
        <h3 className="text-xl font-bold mb-4">Your Bet: {playerState.bet}</h3>
        <h3 className="text-xl font-bold mb-4">
          What you are adding to your bet: {addedBet}
        </h3>
        <h3 className="text-xl font-bold mb-4">
          Your Balance: {playerState.balance}
        </h3>
        <div className={"flex space-x-2"}>
          <button
            onClick={handleFold}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4"
            disabled={gameState.currentPlayer !== playerId}
          >
            Fold
          </button>
          <button
            onClick={handleSubmitBet}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
            disabled={gameState.currentPlayer !== playerId}
          >
            Submit Bet
          </button>
        </div>
        <div className="flex-col space-y-4">
          {Object.entries(chipCounts).map(([color, data]) => (
            <div key={color} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full bg-${color}-500`}
                style={{ backgroundColor: color }}
              />
              <span className="mx-2">Worth: {data.value}</span>
              <span className="mx-2">Adding: {data.count}</span>
              <button
                onClick={() =>
                  handleChipChange(
                    color as "red" | "blue" | "green" | "black" | "yellow",
                    1,
                  )
                }
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              >
                +
              </button>
              <button
                onClick={() =>
                  handleChipChange(
                    color as "red" | "blue" | "green" | "black" | "yellow",
                    -1,
                  )
                }
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                disabled={data.count === 0}
              >
                -
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Betting
