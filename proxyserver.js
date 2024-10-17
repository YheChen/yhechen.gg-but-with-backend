var express = require("express");
var cors = require("cors");
const axios = require("axios");

var app = express();

app.use(cors());

const API_KEY = "RGAPI-505d2833-da03-4162-b3ba-244fdca0f5a7";

function findPlayerPUUID(searchUsername, searchTagline) {
  const riotAPICallString = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${searchUsername}/${searchTagline}?api_key=${API_KEY}`;
  axios.get(riotAPICallString).then(function (response) {
    const PUUID = response.data.puuid;
  });
  return PUUID;
}

app.get("/leagueV4", async (req, res) => {
  const playerName = req.query.username;
  const playerTag = req.query.tagline;

  const playerPUUID = await findPlayerPUUID(playerName, playerTag);
  const leagueV4apiCall = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${playerPUUID}?api_key=${API_KEY}`;

  const leagueV4data = await axios
    .get(leagueV4apiCall)
    .then((response) => response.data);
});

app.listen(4000, function () {
  console.log("server started at port 4000");
});
