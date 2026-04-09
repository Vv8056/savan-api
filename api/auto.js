// /api/auto.js

import SavanApi from "../lib/savanApi.js";

const api = new SavanApi();

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*"); 
  // For production, replace "*" with your domain:
  // res.setHeader("Access-Control-Allow-Origin", "https://yourdomain.com");

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  try {
    const { token, type, lang } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // const data = await api.autoFetch({ token, type });

    let data;

    /* ---------------- RADIO STATION SPECIAL CASE ---------------- */

    if (type === "radio_station") {
      data = await api.getRadioStation({ token, type, lang: lang || "hindi" });
    }

    /* ---------------- DEFAULT AUTO FETCH ---------------- */

    else {
      data = await api.autoFetch({ token, type });
    }

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
