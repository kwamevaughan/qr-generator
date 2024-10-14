import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabaseClient';
import QRCodeGenerator from '../components/QRCodeGenerator';
import QRCodeHistory from '../components/QRCodeHistory';
import InteractiveMap from '../components/InteractiveMap';
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const router = useRouter();
    const [mode, setMode] = useState('light');

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (!session) {
                    router.push('/');
                } else {
                    setUser(session.user);
                }
            } catch (error) {
                console.error('Error fetching session:', error);
            }
        };

        fetchSession();
    }, [router]);

    // Effect to set the mode based on local storage or system preference
    useEffect(() => {
        const savedMode = localStorage.getItem('mode');
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setMode(systemMode);
        }
    }, []);

    useEffect(() => {
        const savedMode = localStorage.getItem('mode');
        setMode(savedMode || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    }, []);

    // Effect to apply the mode class to the body
    useEffect(() => {
        document.body.className = mode === 'dark' ? 'dark-mode' : 'light-mode';
    }, [mode]);



    // Function to toggle dark/light mode
    const toggleMode = () => {
        setMode(prevMode => {
            const newMode = prevMode === 'dark' ? 'light' : 'dark';
            localStorage.setItem('mode', newMode);
            return newMode;
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleQrCodeGenerated = (url) => {
        console.log("QR Code generated for URL:", url);
        // You can add more logic here if needed
    };

    return (
        <div className={`flex flex-col h-screen ${mode === 'dark' ? 'dark' : ''}`}>
            {user ? (
                <>
                    <Header mode={mode} toggleMode={toggleMode} />
                    <div className="flex-grow flex flex-col items-center justify-center mt-8">
                        <QRCodeGenerator user={user} mode="light" onQrCodeGenerated={handleQrCodeGenerated} />
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
