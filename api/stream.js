export default async function handler(req, res) {
    // ... (Your CORS headers from previous step) ...

    const { id } = req.query;
    const JIO_API_URL = `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${id}&type=song&includeMetaTags=0&ctx=wap6dot0&api_version=4&_format=json&_marker=0`;

    try {
        const response = await fetch(JIO_API_URL, {
            method: 'GET',
            headers: {
                // IMPORTANT: This User-Agent mimics a real browser
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.jiosaavn.com/'
            }
        });

        if (response.status === 403) {
            return res.status(403).json({ 
                error: "JioSaavn Forbidden", 
                message: "The source provider blocked the request. Try updating the User-Agent." 
            });
        }

        const data = await response.json();
        // ... (rest of your existing logic to return the song data) ...

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
