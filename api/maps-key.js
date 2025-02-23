export default function handler(req, res) {
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: "Missing Google Maps API Key" });
    }

    res.json({ key: API_KEY }); // ✅ Sends key securely to frontend
}
