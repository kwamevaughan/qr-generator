import { supabase } from '/lib/supabaseClient';
import useragent from 'useragent';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'QR code ID is required' });
    }

    // Extract detailed device type from the User-Agent header
    const userAgent = req.headers['user-agent'];
    const agent = useragent.parse(userAgent);
    const deviceType = agent.device.toString();  // e.g., "Apple iPhone", "Samsung Galaxy", "Windows", "macOS"
    const osType = agent.os.toString();          // e.g., "iOS 14", "Windows 10", "macOS Big Sur"

    // Fetch user's IP address (from the request headers)
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Fetch the ISP, country, and other geolocation data using a geolocation API
    const geoResponse = await fetch(`https://ipinfo.io/${ipAddress}/json?token=f7f86bdf4491ed`);
    const geoData = await geoResponse.json();
    const country = geoData.country;
    const isp = geoData.org;  // This will return the ISP information (e.g., "Comcast", "AT&T", etc.)

    // Log the scan to the database
    const { error } = await supabase
        .from('qr_code_scans')
        .insert([{
            qr_code_id: id,
            scanned_at: new Date(),
            device_type: deviceType,  // e.g., "Apple iPhone", "Windows 10"
            os_type: osType,          // e.g., "iOS 14", "macOS Big Sur"
            country: country,         // e.g., "US", "GB"
            isp: isp,                 // e.g., "Comcast", "AT&T"
            ip_address: ipAddress     // Store the IP address as well
        }]);

    if (error) {
        console.error('Error logging scan:', error);
        return res.status(500).json({ error: 'Error logging scan' });
    }

    // Fetch the target URL for the QR code from the database
    const { data: qrCodeData } = await supabase
        .from('qr_codes')
        .select('url')
        .eq('id', id)
        .single();

    if (!qrCodeData) {
        return res.status(404).json({ error: 'QR code not found' });
    }

    // Redirect to the stored URL
    const redirectTo = qrCodeData.url;
    res.writeHead(302, { Location: redirectTo });
    res.end();
}
