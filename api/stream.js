export default async function handler(req, res) {
    // 1. Set CORS headers to allow your frontend to access this API
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request (Pre-flight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Song ID (pids) is required" });
    }

    // 2. Construct the JioSaavn URL using the parameters you provided
    const JIO_API_URL = `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${id}&type=song&includeMetaTags=0&ctx=wap6dot0&api_version=4&_format=json&_marker=0`;

    try {
        const response = await fetch(JIO_API_URL);
        
        if (!response.ok) throw new Error("Failed to fetch from JioSaavn");

        const data = await response.json();

        // JioSaavn returns an object keyed by the ID, e.g., { "ca2qYABQ": { ... } }
        const songData = data[id] || Object.values(data)[0];

        if (!songData) {
            return res.status(404).json({ error: "Song not found" });
        }

        // 3. Return the clean data to your frontend
        return res.status(200).json(songData);

    } catch (error) {
        console.error("Stream Proxy Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
