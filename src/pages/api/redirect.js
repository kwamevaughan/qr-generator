import { supabase } from '/lib/supabaseClient';
import UAParser from 'ua-parser-js';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'QR code ID is required' });
    }

    const userAgent = req.headers['user-agent'];
    const parser = new UAParser();
    parser.setUA(userAgent);
    const deviceType = parser.getDevice().model || 'Desktop';  // Improved detection
    const osType = parser.getOS().name || 'Unknown OS';        // Improved OS detection

    // Use Cloudflare header to get real client IP
    const ipAddress = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',').shift() || req.socket.remoteAddress;

    // Geolocation API fetch
    const geoResponse = await fetch(`https://ipinfo.io/${ipAddress}/json?token=f7f86bdf4491ed`);
    const geoData = await geoResponse.json();
    const country = geoData.country || 'Unknown';
    const isp = geoData.org || 'Unknown';

    // Logging for debugging
    console.log('IP Address:', ipAddress);
    console.log('Geo Data:', geoData);

    const { error } = await supabase
        .from('qr_code_scans')
        .insert([{
            qr_code_id: id,
            scanned_at: new Date(),
            device_type: deviceType,
            os_type: osType,
            country: country,
            isp: isp,
            ip_address: ipAddress
        }]);

    if (error) {
        console.error('Error logging scan:', error);
        return res.status(500).json({ error: 'Error logging scan' });
    }

    const { data: qrCodeData } = await supabase
        .from('qr_codes')
        .select('url')
        .eq('id', id)
        .single();

    if (!qrCodeData) {
        return res.status(404).json({ error: 'QR code not found' });
    }

    const redirectTo = qrCodeData.url;
    res.writeHead(302, { Location: redirectTo });
    res.end();
}
