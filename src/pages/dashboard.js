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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            {user ? (
                <>
                    <h1 className="text-2xl font-bold">Welcome, {user.email}!</h1>
                    <QRCodeGenerator user={user} />
                    <QRCodeHistory userId={user.id} />
                    <button
                        onClick={handleLogout}
                        className="mt-6 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                        Logout
                    </button>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
