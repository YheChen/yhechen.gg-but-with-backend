var express = require("express");
var cors = require("cors");
const axios = require("axios");

var app = express();

app.use(cors());

const API_KEY = "RGAPI-505d2833-da03-4162-b3ba-244fdca0f5a7";

function findPlayerPUUID(searchUsername, searchTagline) {
  return new Promise((resolve, reject) => {
    const riotAPICallString = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${searchUsername}/${searchTagline}?api_key=${API_KEY}`;
    axios
      .get(riotAPICallString)
      .then(function (response) {
        const PUUID = response.data.puuid;
        resolve(PUUID);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function findPlayerSummonerID(PUUID) {
  return new Promise((resolve, reject) => {
    const riotAPICallString = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${PUUID}?api_key=${API_KEY}`;
    axios
      .get(riotAPICallString)
      .then(function (response) {
        const summonerID = response.data.id;
        resolve(summonerID);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

app.get("/summonerV4", async (req, res) => {
  const playerName = req.query.username;
  const playerTag = req.query.tagline;
  const playerPUUID = await findPlayerPUUID(playerName, playerTag);
  const summonerV4apiCall = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${playerPUUID}?api_key=${API_KEY}`;

  try {
    const response = await axios.get(summonerV4apiCall);
    res.json(response.data); // Sending the response data back to the client
  } catch (error) {
    res.status(500).json({ error: error.message }); // Sending error response in case of failure
  }
});

app.get("/leagueV4", async (req, res) => {
  const playerName = req.query.username;
  const playerTag = req.query.tagline;
  const playerPUUID = await findPlayerPUUID(playerName, playerTag);
  const playerSummonerID = await findPlayerSummonerID(playerPUUID);
  const leagueV4ApiCall = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${playerSummonerID}?api_key=${API_KEY}`;
  try {
    const response = await axios.get(leagueV4ApiCall);
    res.json(response.data); // Sending the response data back to the client
  } catch (error) {
    res.status(500).json({ error: error.message }); // Sending error response in case of failure
  }
});

app.get("/matchV5", async (req, res) => {
  const playerName = req.query.username;
  const playerTag = req.query.tagline;
  const playerPUUID = await findPlayerPUUID(playerName, playerTag);
  const matchV5ApiCallList = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${playerPUUID}/ids?start=0&count=20&api_key=${API_KEY}`;

  const gameIDS = await axios.get(matchV5ApiCallList);
  // change back to 20 games when fixed
  var matchArray = [];
  for (var i = 0; i < gameIDS.data.length - 15; i++) {
    const matchID = gameIDS.data[i];
    const matchV5ApiCallMatchData = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchID}?api_key=${API_KEY}`;

    const matchData = await axios
      .get(matchV5ApiCallMatchData)
      .then((response) => response.data)
      .catch((err) => err);

    matchArray.push(matchData);
  }
  res.json(matchArray);
});

app.listen(4000, function () {
  console.log("Server started at port 4000");
});
