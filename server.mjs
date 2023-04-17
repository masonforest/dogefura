import axios from "axios";
import express from "express";
import cors from "cors";
import {wrapper} from "axios-cookiejar-support";
import {CookieJar} from "tough-cookie";
import * as cheerio from "cheerio";
const app = express();
const port = process.env.PORT || 3000;

const jar = new CookieJar();
const client = wrapper(axios.create({jar}));
axios.defaults.withCredentials = true;
app.use(express.json({type: "text/plain"}));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.post("", async (req, res) => {
  const {method, params} = req.body;
  if (method == "sendrawtransaction") {
    const {config, data} = await client.get(
      "https://live.blockcypher.com/doge/pushtx/"
    );
    const $ = cheerio.load(data);
    const tx = params[0];
    const csrfToken = $('input[name="csrfmiddlewaretoken"]').attr("value");
    await client.post(
      "https://live.blockcypher.com/doge/pushtx/",
      {
        tx_hex: tx,
        coin_symbol: "doge",
        csrfmiddlewaretoken: csrfToken,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Referer: "https://live.blockcypher.com/doge/pushtx/",
        },
      }
    );
    res.json({hex: params[0]});
  } else {
    res.sendStatus(501);
  }
});

app.listen(port, () => console.log(`Dogefura app listening on port ${port}!`));
