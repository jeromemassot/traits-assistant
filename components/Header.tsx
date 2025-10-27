
import React from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

const DotsVerticalIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
);

export const Header: React.FC = () => {
    const { token, login, logout } = useAuth();

    const googleLogin = useGoogleLogin({
        onSuccess: tokenResponse => {
            login(tokenResponse.access_token);
        },
        onError: errorResponse => {
            console.error('Google login failed:', errorResponse);
        },
        scope: 'https://www.googleapis.com/auth/devstorage.read_only',
    });

    const handleLogout = () => {
        googleLogout();
        logout();
    };

    return (
        <header className="bg-white/75 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-end items-center h-16">
                    <div className="flex items-center space-x-4">
                        {token ? (
                            <button 
                                onClick={handleLogout} 
                                className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                            >
                                Logout
                            </button>
                        ) : (
                            <button 
                                onClick={() => googleLogin()} 
                                className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                            >
                                Login with Google
                            </button>
                        )}
                        <button className="p-2 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                            <DotsVerticalIcon />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
