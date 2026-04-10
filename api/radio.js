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
      const { stationid, token, type, lang } = req.query;

      if (!stationid) {
        return res.status(400).json({ error: "stationid or token required" });
      }

      // const data = await api.getRadioStationById({ stationid });
        let data;

        /* ---------------- TRY FETCH ---------------- */

        if (stationid) {
          data = await api.getRadioStationById({ stationid });
        }

        /* ---------------- IF FAILED → RECREATE ---------------- */

        if ( !data || data.error === "No new song found for current radio." ) {
          if (!token) {
            return res.status(200).json({ stationid, error: "Station expired — token required to recreate" });
          }
            
          const station = await api.getRadioStation({ token, type, lang });

          const newStationId = station?.stationid;

          if (!newStationId) {
            throw new Error( "Failed to create station" );
          }
          data = await api.getRadioStationById({ stationid: newStationId });
        }

      res.setHeader( "Cache-Control", "no-store" );
      res.status(200).json(data);
    }

    catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
