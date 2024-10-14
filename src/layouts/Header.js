import React from 'react';
import MoonIcon from '@heroicons/react/24/outline/MoonIcon'; // Dark mode icon
import SunIcon from '@heroicons/react/24/outline/SunIcon'; // Light mode icon
import FullScreenIcon from '@heroicons/react/24/outline/ArrowsPointingInIcon'; // Full screen icon
import Image from 'next/image';
import { useRouter } from 'next/router';

const Header = ({ mode, toggleMode }) => {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        router.push('/'); // Redirect to login on logout
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <header className={`p-4 transition-all duration-300 shadow-md border-b border-gray-300 ${mode === 'dark' ? 'bg-[#0a0c1d] text-white shadow-lg' : 'bg-white text-black'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center">
                        <Image src="/assets/images/logo-full.png" alt="Logo" width={180} height={25} priority />
                    </div>
                </div>

                <div className="relative flex items-center space-x-2 pt-4 md:pt-0">
                    <button
                        onClick={toggleFullScreen}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 transition">
                        <FullScreenIcon className="h-5 w-5 text-gray-500 hover:text-blue-600 transition" />
                    </button>

                    <button
                        onClick={toggleMode}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 transition">
                        {mode === 'dark' ? (
                            <SunIcon className="h-5 w-5 text-gray-500 hover:text-blue-600 transition"/> // Light mode icon
                        ) : (
                            <MoonIcon className="h-5 w-5 text-gray-500 hover:text-blue-600 transition"/> // Dark mode icon
                        )}
                    </button>

                    <div className="relative">
                        <button
                            onClick={handleLogout}
                            className="block w-full rounded-full text-left px-4 py-2 text-sm text-white hover:bg-gray-200 hover:text-black bg-red-600">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
