import "./styles.css";

import * as PIXI from "pixi.js";
import PartySocket from "partysocket";

let pingInterval;

const output = document.getElementById("app");

function add(text) {
  output.appendChild(document.createTextNode(text));
  output.appendChild(document.createElement("br"));
}

const conn = new PartySocket({
  host: PARTYKIT_HOST,
  room: "my-new-room",
});

let name = "anon";
const bunny = PIXI.Sprite.from("/blob_aww.png");

const players = {};
let me = null;

conn.addEventListener("message", function (event) {
  let updates = JSON.parse(event.data);
  let serverPlayers = Object.keys(updates.positions);
  let positions = updates.positions;
  output.innerText = `Players: ${serverPlayers.length}`;
  serverPlayers.forEach((player) => {
    if (players[player]?.status) {
      let [x, y] = positions[player].split(",");
      if (x == "dead" || y == "dead") {
        players[player].status = false;
        let dead = players[player].token;
        killPlayer(dead);
        delete players[player];
      } else {
        if (player != me) {
          players[player].token.x = x;
          players[player].token.y = y;
        }
      }
    } else {
      players[player] = {};
      players[player].status = "alive";
      players[player].position = updates[player];
      if (player != me) {
        players[player].token = PIXI.Sprite.from(
          "https://pixijs.com/assets/bunny.png"
        );
        let [x, y] = positions[player].split(",");
        players[player].token.x = x;
        players[player].token.y = y;
        players[player].token.anchor.set(0.5);
        app.stage.addChild(players[player].token);
      }
    }
  });
});

conn.addEventListener("open", function () {
  if (name) {
    bunny.anchor.set(0.5);
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;
    bunny.height = 37;
    bunny.width = 26;
    app.stage.addChild(bunny);
    conn.send(`spawn;${bunny.x},${bunny.y}`);
    me = conn._pk;
  }
});

const app = new PIXI.Application({
  background: "#1099bb",
  resizeTo: window,
});

document.body.appendChild(app.view);

const SIZE = 16;

document.addEventListener("keydown", (event) => {
  var move = event.key;
  var code = event.code;

  if (code == "Space") {
    conn.send(`fire;${bunny.x},${bunny.y}`);
    return;
  }

  if (move == "w" || move == "up") {
    bunny.y = bunny.y - SIZE;
  }
  if (move == "s" || move == "down") {
    bunny.y = bunny.y + SIZE;
  }
  if (move == "a" || move == "left") {
    bunny.x = bunny.x - SIZE;
  }
  if (move == "d" || move == "right") {
    bunny.x = bunny.x + SIZE;
  }
  conn.send(`move;${bunny.x},${bunny.y}`);
});

function removePlayerToken(player) {
  app.stage.removeChild(player);
}

function killPlayer(dead) {
  let flush = 0;
  const ticker = new PIXI.Ticker();
  ticker.add((delta) => {
    flush++;
    deadTicker(delta, dead, flush, ticker);
  });
  ticker.start();
}

function deadTicker(delta, dead, flush, ticker) {
  if (flush < 100) {
    dead.rotation += 0.25 * delta;
  } else {
    removePlayerToken(dead);
    ticker.destroy();
  }
}
