import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import GuestQRCodeGenerator from "@/components/GuestQRCodeGenerator";
import { toast } from 'react-toastify';
import { supabase } from "../../lib/supabaseClient";
import Image from "next/image";
import Modal from "@/components/Modal"; // Ensure to import the Modal component

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            setEmail(storedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            toast.error('Login failed: ' + error.message, { position: 'top-center' });
        } else {
            toast.success('Login successful!', { position: 'top-center' });
            if (rememberMe) {
                localStorage.setItem('email', email);
            } else {
                localStorage.removeItem('email');
            }
            setTimeout(() => {
                router.push('/dashboard');
            }, 500);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 flex-col"
             style={{
                 backgroundImage: `url(assets/images/tender-bg-3.jpg)`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat',
             }}>
            <Image
                src="/assets/images/logo-full.png" // Ensure this path is correct
                alt="Logo"
                width={200}
                height={75}
                className="block md:absolute top-0 left-0 md:m-5 md:top-5 md:left-5 mt-10 mb-10 md:mt-0 md:mb-0"
            />

            <div className="w-full max-w-md mb-8">
                <GuestQRCodeGenerator mode="light"
                                      onQrCodeGenerated={(url) => console.log("QR Code generated for URL:", url)}/>
            </div>

            <p>
                To track QR codes, you need to log in to the dashboard.
            </p>

            <button
                onClick={() => setShowModal(true)}
                className={`mt-4 px-8 py-2 bg-gray-500 text-white rounded-full hover:bg-white hover:text-black transform transition-transform duration-300 ease-in-out hover:scale-105`}
            >
                Login to Dashboard
            </button>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <h2 className="text-2xl font-bold text-center mb-6">Welcome Back!</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="mb-4 relative">
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 pr-10"
                            placeholder="Password"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-2"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                            {passwordVisible ? <AiFillEyeInvisible size={20}/> : <AiFillEye size={20}/>}
                        </button>
                    </div>
                    <div className="mb-4 flex items-center">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                                className="mr-2"
                            />
                            <span className="text-sm">Remember Me</span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                    >
                        Login
                    </button>
                </form>
                <button
                    onClick={() => { /* Handle reset password logic */
                    }}
                    className="mt-4 text-indigo-600 hover:underline"
                >
                    Reset Password
                </button>
            </Modal>
        </div>
    );
}
