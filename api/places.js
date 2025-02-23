export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { lat, lon, type, keyword } = req.query;
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY; // Ensure this is set in your Vercel environment variables
    if (!lat || !lon || !type || !keyword) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=2000&type=${type}&keyword=${encodeURIComponent(keyword)}&key=${API_KEY}`;
    console.log("Calling Google Places API with URL:", url);
    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
}
