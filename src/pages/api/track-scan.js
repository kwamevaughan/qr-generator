import { supabase } from '/lib/supabaseClient';

export default async function handler(req, res) {
    const { qrId, deviceType, location } = req.body;

    // Insert scan details into a new table, e.g., "qr_code_scans"
    const { error } = await supabase
        .from('qr_code_scans')
        .insert([{ qr_code_id: qrId, device_type: deviceType, location }]);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Scan tracked successfully' });
}
