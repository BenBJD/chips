import { useEffect, useState } from "react"
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

  useEffect(() => {
    if (
      playerState.status === "folded" &&
      gameState.currentPlayer === playerId
    ) {
      console.log("folded so auto skipping for player", playerId)
      sendJsonMessage({ type: "bet", data: "fold" } as Message)
    }
  }, [gameState])

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
      <div className="flex text-white flex-col items-center justify-center h-screen">
        <h2 className={"text-3xl mb-4 font-bold"}>
          Player {gameState.currentPlayer} is Betting
        </h2>
        <h3 className="text-2xl font-bold mb-4">
          Balance: {playerState.balance}
        </h3>
        <h2 className="text-2xl font-bold mb-4">
          Highest Bet:
          {" " +
            gameState.players.reduce(
              (acc, player) => Math.max(acc, player.bet),
              0,
            )}
        </h2>
        <h3 className="text-2xl font-bold mb-4">Your Bet: {playerState.bet}</h3>
      </div>
    )
  }

  return (
    <div className="flex text-white flex-col items-center justify-center h-screen">
      <div className="flex flex-col m-auto items-center justify-center">
        <h2 className={"text-3xl mb-3 font-bold"}>Make a Bet</h2>
        <h2 className="text-2xl font-bold mb-2">
          To Match:
          <b>
            {" " +
              gameState.players.reduce(
                (acc, player) => Math.max(acc, player.bet),
                0,
              )}
          </b>
        </h2>
        <h3
          className={
            "text-2xl font-bold mb-4" +
            (playerState.bet <
            gameState.players.reduce(
              (acc, player) => Math.max(acc, player.bet),
              0,
            )
              ? " text-red-500"
              : "")
          }
        >
          Your Bet: <b>{playerState.bet}</b>
        </h3>
        <h3 className="text-xl font-bold mb-2">
          Balance: <b>{playerState.balance}</b>
        </h3>
        <h3 className="text-2xl font-bold mb-2">
          Call: <b>{addedBet}</b>
        </h3>
        <div className={"flex space-x-8 m-2"}>
          <button
            onClick={handleFold}
            className="bg-red-500 hover:bg-red-700 text-white text-3xl font-bold py-2 px-4 rounded mb-4"
          >
            Fold
          </button>
          <button
            onClick={handleSubmitBet}
            className="bg-green-500 hover:bg-green-700 text-white text-3xl font-bold py-2 px-4 rounded mb-4"
          >
            {playerState.bet + addedBet ===
            gameState.players.reduce(
              (acc, player) => Math.max(acc, player.bet),
              0,
            )
              ? "Check"
              : playerState.bet + addedBet <
                  gameState.players.reduce(
                    (acc, player) => Math.max(acc, player.bet),
                    0,
                  )
                ? "Add to Match"
                : "Raise"}
          </button>
        </div>
        <div className="flex-col flex space-y-4 items-center justify-center">
          {Object.entries(chipCounts).map(([color, data]) => (
            <div key={color} className="flex items-center space-x-4">
              <div
                className={`w-10 h-10 rounded-full bg-${color}-500`}
                style={{ backgroundColor: color }}
              />
              <div className={"flex m-1 flex-col items-center justify-center"}>
                <h3>Value</h3>
                <h3 className="text-2xl font-bold">{data.value}</h3>
              </div>
              <div className={"flex m-1 flex-col items-center justify-center"}>
                <h3>Adding</h3>
                <h3 className="text-2xl font-bold">{data.count}</h3>
              </div>
              <button
                onClick={() =>
                  handleChipChange(
                    color as "red" | "blue" | "green" | "black" | "yellow",
                    -1,
                  )
                }
                className="bg-red-500 hover:bg-red-700 text-white font-bold text-4xl py-3 px-6 rounded-2xl"
                disabled={data.count === 0}
              >
                -
              </button>
              <button
                onClick={() =>
                  handleChipChange(
                    color as "red" | "blue" | "green" | "black" | "yellow",
                    1,
                  )
                }
                className="bg-blue-500 hover:bg-blue-700 text-white text-4xl font-bold py-3 px-5 rounded-2xl"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Betting
