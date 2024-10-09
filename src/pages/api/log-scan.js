// pages/api/log-scan.js
import { supabase } from '/lib/supabaseClient';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { id } = req.query; // Get the QR code ID from the query
        console.log('Received request to log scan with id:', id); // Log the received id

        if (!id) {
            return res.status(400).json({ error: 'QR code ID is required' });
        }

        // Prepare the scan data
        const scanData = {
            qr_code_id: id, // Link to the scanned QR code ID
            scanned_at: new Date(), // Log the scan time
            user_id: null, // Update with user ID if available
            device_type: req.headers['user-agent'], // Use user agent from request headers
        };

        console.log('Inserting scan data:', scanData); // Log what will be inserted

        // Insert the scan into the database
        const { data, error } = await supabase
            .from('qr_code_scans')
            .insert([scanData]);

        if (error) {
            console.error('Error logging scan:', error);
            return res.status(500).json({ error: 'Error logging scan', details: error.message });
        }

        // Check if data is returned
        if (!data || data.length === 0) {
            return res.status(500).json({ message: 'No data was inserted', data });
        }

        // Respond with success
        res.status(200).json({ message: 'Scan logged successfully', data });
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
