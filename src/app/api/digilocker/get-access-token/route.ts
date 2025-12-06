import { NextRequest, NextResponse } from 'next/server';

const COMPANY_NAME = 'ishaanBzpl';
const SECRET_TOKEN = 'QXVyxzIFiFWoLM4RHQbTRJXLfIWEsCTP';

export async function POST(request: NextRequest) {
  try {
    const response = await fetch('https://digilocker.meon.co.in/get_access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_name: COMPANY_NAME,
        secret_token: SECRET_TOKEN,
      }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, read as text for debugging
      const text = await response.text();
      console.error('Non-JSON response from DigiLocker:', text);
      return NextResponse.json(
        { error: 'Invalid response from DigiLocker API', details: text.substring(0, 200) },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.msg || data.error || 'Failed to generate access token', success: false },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in get-access-token:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

