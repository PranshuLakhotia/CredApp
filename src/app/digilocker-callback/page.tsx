'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DigiLockerCallback() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Processing...');

    useEffect(() => {
        // Extract parameters from URL
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        console.log('DigiLocker Callback Params:', params);

        // Communicate back to opener
        if (window.opener) {
            window.opener.postMessage({
                type: 'DIGILOCKER_CALLBACK',
                params: params
            }, window.location.origin);

            setStatus('Success! You can close this window.');
            setTimeout(() => {
                window.close();
            }, 1500);
        } else {
            setStatus('Error: No opening window found.');
        }
    }, [searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">DigiLocker Connection</h2>
                <p className="text-gray-600">{status}</p>
            </div>
        </div>
    );
}
