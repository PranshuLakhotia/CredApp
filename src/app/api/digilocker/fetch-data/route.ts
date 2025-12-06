import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_token, state } = body;

    if (!client_token || !state) {
      return NextResponse.json(
        { error: 'Missing required parameters: client_token and state' },
        { status: 400 }
      );
    }

    const response = await fetch('https://digilocker.meon.co.in/v2/send_entire_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_token,
        state,
        status: true,
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
        { error: data.msg || data.error || 'Failed to retrieve documents', success: false },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in fetch-data:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

