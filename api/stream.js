export default async function handler(req, res) {
    // 1. Enhanced CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Capture ID from clean URL path or query string
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Song ID is required" });
    }

    // 2. JioSaavn API Call
    const JIO_API_URL = `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${id}&type=song&includeMetaTags=0&ctx=wap6dot0&api_version=4&_format=json&_marker=0`;

    try {
        const response = await fetch(JIO_API_URL);
        
        if (!response.ok) throw new Error("JioSaavn fetch failed");

        const data = await response.json();

        // JioSaavn returns { "Fa6NZlxg": { ... } }
        let songData = data[id] || Object.values(data)[0];

        if (!songData) {
            return res.status(404).json({ error: "Song not found" });
        }

        // 3. Optimization: Flatten the object for the Player
        // This makes it easier for your frontend to find the encrypted_media_url
        const responseData = {
            id: songData.id,
            title: songData.title,
            subtitle: songData.subtitle,
            image: songData.image,
            // Ensure encrypted_media_url is at the top level for easy access
            encrypted_media_url: songData.more_info?.encrypted_media_url || songData.encrypted_media_url,
            album: songData.more_info?.album || songData.album,
            duration: songData.more_info?.duration || songData.duration
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error("Proxy Error:", error);
        return res.status(500).json({ error: "Failed to fetch stream details" });
    }
}
