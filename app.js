const express = require("express");
const app = express();

const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT
            player_id AS playerId,
            player_name As playerName
        FROM 
            player_details;
    `;
  const playersDbObject = await db.all(getPlayersQuery);
  response.send(playersDbObject);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getOnePlayerQuery = `
        SELECT
            player_id AS playerId,
            player_name AS playerName
        FROM
            player_details
        WHERE
            player_id = ${playerId};
    `;
  const onePlayer = await db.get(getOnePlayerQuery);
  response.send(onePlayer);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerNameQuery = `
        UPDATE 
            player_details
        SET
            player_name = "${playerName}"
        WHERE
            player_id = ${playerId};
    `;
  await db.run(updatePlayerNameQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetailsQuery = `
        SELECT
            match_id AS matchId,
            match,
            year
        FROM
            match_details
        WHERE
            match_id = ${matchId};
    `;
  const matchDbObject = await db.get(matchDetailsQuery);
  response.send(matchDbObject);
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const playerMatchDetailsQuery = `
        SELECT
            match_id AS matchId,
            match,
            year
        FROM
            player_match_score NATURAL JOIN match_details
        WHERE
            player_id = ${playerId};
    `;
  const playerMatchDetails = await db.all(playerMatchDetailsQuery);
  response.send(playerMatchDetails);
});

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const playersInMatchQuery = `
        SELECT 
            player_id AS playerId,
            player_name AS playerName
        FROM 
            player_details NATURAL JOIN player_match_score
        WHERE
            match_id = ${matchId};
    `;
  const playersInMatchObject = await db.all(playersInMatchQuery);
  response.send(playersInMatchObject);
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const playerScoresQuery = `
        SELECT
            player_id AS playerId,
            player_name AS playerName,
            SUM(score) AS totalScore,
            SUM(fours) AS totalFours,
            SUM(sixes) AS totalSixes
        FROM 
            player_match_score NATURAL JOIN player_details
        WHERE
            player_id = ${playerId};
    `;
  const playerScores = await db.get(playerScoresQuery);
  response.send(playerScores);
});

module.exports = app;
