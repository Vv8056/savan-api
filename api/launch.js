// /api/launch.js

import SavanApi from "../lib/savanApi.js";

const api = new SavanApi();

export default async function handler(req, res) {

  // Cors origin allowed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  try {
    const data = await api.getLaunch();

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
