const Result = require("../model/Result");
const { newResId } = require("../config/channels");
const client = require("../services/discord");
const Report = require('./sendErrorReport');

const mapping = {
  e: "erangel",
  r: "rondo",
  m: "miramar",
};

async function saveResult(message) {
  const channel = await client.channels.fetch(newResId);

  try {
    const { content, colorCase } = formatResult(message);

    let color = 0xf2f2f2;

    switch (colorCase) {
      case 2:
        color = 0xff0000 //red
        break;
      case 1:
        color = 0xffa500 //orange
        break;
      case 0:
        color = 0xffd700 // yellow
        break;        
    }

    const resultObj = {
      map: mapping[content.map],
      pos: content.pos,
      type: content.type,
      kills: content.kills,
      sangwan: content.sa,
      mayank: content.ma,
      contra: content.co,
      jahir: content.ja,
      sungod: content.su,
      campz: content.ca,
      others: content.o,
    };

    await Result.create(resultObj);

    // Create a list of players
    const players = [
      { name: "SangWan", value: resultObj.sangwan },
      { name: "Mayank", value: resultObj.mayank },
      { name: "Rusher", value: resultObj.contra },
      { name: "Jahir", value: resultObj.jahir },
      { name: "Sungod", value: resultObj.sungod },
      { name: "Campzzz", value: resultObj.campz },
      { name: "Randoms", value: resultObj.others },
    ];

    const playerLines = players
      .filter((p) => p.value !== -1)
      .map((p) => `➤ ${p.name} : ${p.value}`)
      .join("\n");

    const embed = {
      title: "ESPORTS RESULT",
      color: color,
      description: `
**Players Performance:-**

${playerLines}

**About Match:-**

➤ Map : ${resultObj.map.charAt(0).toUpperCase() + resultObj.map.slice(1)}
➤ Position : ${resultObj.pos}
➤ Type : ${resultObj.type.charAt(0).toUpperCase() + resultObj.type.slice(1)}
`,
    };

    channel.send({ embeds: [embed] });
  } catch (err) {
    console.log("Error:", err);
  }
}

function formatResult(result) {

  try {

    result = result.slice(4).trim();
    const res = result.split(" ");
  
    let content = {
      map: "random",
      pos: 0,
      type: "others",
      kills: null,
      sa: -1,
      su: -1,
      ma: -1,
      co: -1,
      ja: -1,
      o: -1,
      ca: -1
    };
  
    const players = ["sa", "su", "ma", "co", "ja", "o", "ca"];
  
    let kills = 0;
  
    for (const s of res) {
      const temp = s.split("-");
      const key = temp[0];
      let value = temp[1];
  
      if (players.includes(key) || key === "pos") {
        value = Number(value);
      }
  
      if (key in content) {
        content[key] = value;
      }
    }
  
    for (const key of players) {
      if (content[key] !== -1) {
        kills += content[key];
      }
    }
  
    content.kills = kills;
    const colorCase = (kills > 20) ? 2 : (kills > 10) ? 1 : (kills > 5) ? 0 : -1;

    return { content,  colorCase };

  } catch (err) {
    console.log("Error:", err);

    const rep = new Report(err.type, err.message);
    
    return err.send();
  }

}

module.exports = { saveResult };
