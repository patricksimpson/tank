class PartyServer {
  constructor(party) {
    this.party = party;
    this.messages = [];
    this.positions = {};
  }

  onConnect(conn, ctx) {
    conn.send(JSON.stringify({ positions: this.positions }));
  }

  onClose(conn) {
    this.positions[conn.id] = "dead,dead";
    this.party.broadcast(JSON.stringify({ positions: this.positions }));
    delete this.positions[conn.id];
  }

  onMessage(message, sender) {
    let command = message.split(";");
    if (command[0] == "move") {
      this.positions[sender.id] = command[1];
      this.party.broadcast(JSON.stringify({ positions: this.positions }));
    }
    if (command[0] == "fire") {
      console.log("SHOOT!");
    }
  }
}

export default PartyServer;
