import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-toastify';

export default function ResetPassword() {
    const router = useRouter();
    const { access_token } = router.query; // Get the access token from the query parameters
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!access_token) {
            toast.error('Invalid token, please check your email link.');
            router.push('/'); // Redirect to login if token is missing
        }
    }, [access_token, router]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Sign in using the access token to validate it
        const { error } = await supabase.auth.signIn({ access_token });

        if (error) {
            toast.error('Invalid token, please check your email link.');
            setLoading(false);
            return;
        }

        // Now attempt to update the user's password
        const { user, error: updateError } = await supabase.auth.update({ password: newPassword });

        if (updateError) {
            toast.error('Password reset failed: ' + updateError.message);
        } else {
            toast.success('Password has been reset successfully!');
            router.push('/dashboard'); // Redirect to login page after successful reset
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 flex-col">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
                <h2 className="text-2xl font-bold text-center mb-6">Reset Your Password</h2>
                <form onSubmit={handleResetPassword}>
                    <div className="mb-4">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                            placeholder="New Password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
