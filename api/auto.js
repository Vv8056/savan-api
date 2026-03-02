// /api/auto.js

import SavanApi from "../lib/savanApi.js";

const api = new SavanApi();

export default async function handler(req, res) {
  try {
    const { token, type } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const data = await api.autoFetch({ token, type });

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
