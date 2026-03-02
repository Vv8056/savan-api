import SavanApi from "../lib/savanApi.js";

const api = new SavanApi();

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  try {
    const { q, page } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Query required" });
    }

    const data = await api.Search({
      query: q,
      page: page || 1
    });

    res.setHeader("Cache-Control", "s-maxage=120");
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
