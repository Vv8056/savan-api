// /api/radio.js

import SavanApi from "../lib/savanApi.js";

const api = new SavanApi();

export default async function handler( req, res) {

    /* CORS */
    res.setHeader( "Access-Control-Allow-Origin", "*" );
    res.setHeader( "Access-Control-Allow-Methods", "GET, OPTIONS" );
    res.setHeader( "Access-Control-Allow-Headers", "Content-Type" );

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    try {
      const { stationid } = req.query;

      if (!stationid) {
        return res.status(400).json({ error: "stationid required" });
      }

      const data = await api.getRadioStationById({ stationid });

      res.setHeader( "Cache-Control", "s-maxage=60" );
      res.status(200).json(data);
    }

    catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
