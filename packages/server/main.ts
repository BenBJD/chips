import { WebSocketServer } from "ws"
const wss = new WebSocketServer({ port: 8080 })
console.log("Server started at ", wss.address())

type Player = {
  id: number
  name: string
  balance: number
  bet: number
  status: "active" | "folded"
  winVote: number
}
const gameState = {
  state: "setup" as "setup" | "betting" | "voting" | "cardFlipping",
  startPlayer: 0,
  lastPlayer: 0,
  currentVoter: 0,
  currentPlayer: 0,
  minimumBet: 10,
  startingBalance: 2000,
  chipValues: [10, 20, 50, 100, 200],
  players: [] as Player[],
  game: 1,
}

type Message = {
  type:
    | "join"
    | "start"
    | "bet"
    | "vote"
    | "startVote"
    | "end"
    | "resumeBetting"
  data: any
}

wss.on("connection", function connection(ws) {
  console.log("connection established")
  ws.on("error", console.error)

  ws.on("message", function message(data) {
    const jsonData = JSON.parse(data.toString()) as Message
    console.log(jsonData)

    // Send the current game state to the new player
    if (jsonData.type === "join") {
      // If the user provides an id, use it
      if (
        jsonData.data !== undefined &&
        jsonData.data < gameState.players.length
      ) {
        const player = gameState.players[jsonData.data]
        // Send player ID and state to joining player
        ws.send(
          JSON.stringify({
            playerId: player.id,
            gameState,
          }),
        )
        // Send the current state to all players
        wss.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              playerId: null,
              gameState,
            }),
          )
        })
        return
      }
      // Otherwise, create a new player
      const player: Player = {
        id: gameState.players.length,
        name: `Player ${gameState.players.length}`,
        balance: gameState.startingBalance,
        bet: 0,
        status: "active",
        winVote: 0,
      }
      console.log("player joined:", player)
      gameState.players.push(player)
      ws.send(
        JSON.stringify({
          playerId: player.id,
          gameState,
        }),
      )
      // Send the current state to all players
      wss.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            playerId: null,
            gameState,
          }),
        )
      })
    }

    // Handle starting the whole thing
    if (jsonData.type === "start") {
      // If there are not enough players, return
      if (gameState.players.length < 2) {
        return
      }
      // If game has started, just send the current state
      if (gameState.state !== "setup") {
        wss.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              playerId: null,
              gameState,
            }),
          )
        })
        return
      }
      gameState.state = "betting"
      gameState.game = 1
      gameState.currentPlayer = 0
      gameState.currentVoter = 0
      gameState.startPlayer = 0
      gameState.lastPlayer = gameState.players.length - 1
      gameState.players.forEach((player) => {
        player.balance = gameState.startingBalance
        player.bet = 0
        player.status = "active"
        player.winVote = 0
      })
      console.log("Game started")
      wss.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            playerId: null,
            gameState,
          }),
        )
      })
    }

    if (jsonData.type === "resumeBetting") {
      gameState.state = "betting"
      gameState.currentPlayer = gameState.startPlayer
      wss.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            playerId: null,
            gameState,
          }),
        )
      })
      console.log("Resuming betting")
    }

    // Handle betting
    if (jsonData.type === "bet") {
      const player = gameState.players[gameState.currentPlayer]

      // Handle folding
      if (player.status === "folded" || jsonData.data === "fold") {
        player.status = "folded"
      } else {
        // Add the bet to the pot and subtract it from the player's balance
        player.bet += jsonData.data
        player.balance -= jsonData.data
      }

      // If at last player and active players have the same bet, move to card flipping
      // Otherwise, move to the next player
      const highestBet = Math.max(...gameState.players.map((p) => p.bet))
      if (
        gameState.currentPlayer === gameState.lastPlayer &&
        gameState.players
          .filter((p) => p.status === "active")
          .every((p) => p.bet === highestBet)
      ) {
        gameState.state = "cardFlipping"
        gameState.currentVoter = gameState.startPlayer
      } else {
        gameState.currentPlayer =
          (gameState.currentPlayer + 1) % gameState.players.length
      }

      console.log("Player bet")

      // Update game state
      wss.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            playerId: null,
            gameState,
          }),
        )
      })
    }

    if (jsonData.type === "startVote") {
      gameState.state = "voting"
      gameState.currentPlayer = gameState.startPlayer
      wss.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            playerId: null,
            gameState,
          }),
        )
      })
      console.log("Starting vote")
    }

    // Handle voting
    if (jsonData.type === "vote") {
      const player = gameState.players[gameState.currentPlayer]
      player.winVote = jsonData.data
      gameState.currentPlayer =
        (gameState.currentPlayer + 1) % gameState.players.length
      if (gameState.currentPlayer === gameState.startPlayer) {
        // Find and reward the winner
        const votes = gameState.players.map((p) => p.winVote)
        // Find how many votes each player got
        const voteCounts = Array(gameState.players.length).fill(0)
        votes.forEach((vote) => voteCounts[vote]++)
        // Find the player with the most votes
        const maxVotes = Math.max(...voteCounts)
        const winner = voteCounts.indexOf(maxVotes)
        // Give the pot to the winner
        const pot = gameState.players.reduce((acc, p) => acc + p.bet, 0)
        gameState.players[winner].balance += pot

        // Handle end of game
        gameState.game++
        gameState.state = "betting"
        gameState.startPlayer =
          (gameState.startPlayer + 1) % gameState.players.length
        gameState.lastPlayer =
          (gameState.lastPlayer + 1) % gameState.players.length
        gameState.currentPlayer = gameState.startPlayer
        gameState.players.forEach((player) => {
          player.bet = 0
          player.status = "active"
          player.winVote = 0
        })
      }
      console.log("Player voted")
      wss.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            playerId: null,
            gameState,
          }),
        )
      })
    }

    // Handle end of game
    if (jsonData.type === "end") {
      gameState.players = []
      gameState.state = "setup"
      gameState.currentPlayer = 0
      gameState.currentVoter = 0
      gameState.startPlayer = 0
      gameState.lastPlayer = 0
      gameState.minimumBet = 10
      gameState.startingBalance = 2000
      gameState.chipValues = [10, 20, 50, 100, 200]
      gameState.game = 1
      console.log("Game ended")
      wss.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            playerId: null,
            gameState,
          }),
        )
      })
    }
  })
})
