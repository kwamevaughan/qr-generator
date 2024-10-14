import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabaseClient';
import QRCodeGenerator from '../components/QRCodeGenerator';
import QRCodeHistory from '../components/QRCodeHistory';
import InteractiveMap from '../components/InteractiveMap';
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";

export default function Dashboard({ mode, toggleMode }) {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;

            if (!session) {
                router.push('/');
            } else {
                setUser(session.user);
            }
        };

        fetchSession();
    }, [router]);

    const handleQrCodeGenerated = (url) => {
        console.log("QR Code generated for URL:", url);
    };

    return (
        <div className={`flex flex-col h-screen ${mode === 'dark' ? 'dark' : ''}`}>
            {user ? (
                <>
                    <Header mode={mode} toggleMode={toggleMode} />
                    <div className="flex-grow flex flex-col items-center justify-center mt-8">
                        <QRCodeGenerator user={user} mode={mode} onQrCodeGenerated={handleQrCodeGenerated} />
                        <QRCodeHistory userId={user.id} mode={mode} />
                        <InteractiveMap mode={mode} />
                        <Footer mode={mode} />
                    </div>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
