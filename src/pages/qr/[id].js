// src/pages/qr/[id].js
import { supabase } from '/lib/supabaseClient';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const QRRedirect = ({ qrCode }) => {
    const router = useRouter();

    useEffect(() => {
        const logScan = async () => {
            // Log the scan event
            await fetch('/api/track-scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    qr_code_id: qrCode.id,
                    device_type: 'mobile', // You can dynamically detect device type here
                    location: 'Nairobi', // Get location data dynamically
                }),
            });

            // Redirect to the URL linked to the QR code
            router.push(qrCode.url);
        };

        logScan();
    }, [router, qrCode]);

    return <p>Redirecting...</p>;
};

export async function getServerSideProps({ params }) {
    const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error) {
        return { notFound: true };
    }

    return { props: { qrCode: data } };
}

export default QRRedirect;
