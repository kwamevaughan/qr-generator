// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabaseClient';
import QRCodeGenerator from '../components/QRCodeGenerator';
import QRCodeHistory from '../components/QRCodeHistory';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/');
            } else {
                setUser(session.user);
            }
        };

        fetchSession();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            {user ? (
                <h1 className="text-2xl font-bold">Welcome, {user.email}!</h1>
            ) : (
                <p>Loading...</p>
            )}

            <QRCodeGenerator user={user} />
            <QRCodeHistory userId={user ? user.id : null} />

            <button
                onClick={handleLogout}
                className="mt-6 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
                Logout
            </button>
        </div>
    );
}
