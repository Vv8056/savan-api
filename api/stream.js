export default async function handler(req, res) {
    // 1. Standard CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 2. Safely capture the ID
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: "Missing song ID (pids)" });
    }

    const JIO_API = `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${id}&type=song&includeMetaTags=0&ctx=wap6dot0&api_version=4&_format=json&_marker=0`;

    try {
        // 3. Fetch with a Timeout to prevent Vercel from hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch(JIO_API, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return res.status(response.status).json({ error: "JioSaavn API unreachable" });
        }

        const text = await response.text();
        
        // 4. Safe JSON Parsing (Crucial for fixing 500 errors)
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Malformed JSON from JioSaavn:", text);
            return res.status(502).json({ error: "Invalid response from music provider" });
        }

        const rawSong = data[id] || Object.values(data)[0];

        if (!rawSong) {
            return res.status(404).json({ error: "Track not found in data set" });
        }

        // 5. Build flattened response
        const cleanSong = {
            id: rawSong.id,
            title: rawSong.title,
            image: rawSong.image?.replace("150x150", "500x500"),
            album: rawSong.more_info?.album || rawSong.album,
            encrypted_media_url: rawSong.more_info?.encrypted_media_url || rawSong.encrypted_media_url,
            duration: rawSong.more_info?.duration || rawSong.duration
        };

        return res.status(200).json(cleanSong);

    } catch (error) {
        // Handle Timeout vs Connection Error
        if (error.name === 'AbortError') {
            return res.status(504).json({ error: "Gateway Timeout: Music source too slow" });
        }
        console.error("Critical Proxy Error:", error);
        return res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}
