import { NextRequest, NextResponse } from 'next/server';

const COMPANY_NAME = 'ishaanBzpl';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_token, redirect_url } = body;

    if (!client_token || !redirect_url) {
      return NextResponse.json(
        { error: 'Missing required parameters: client_token and redirect_url' },
        { status: 400 }
      );
    }

    const requestBody = {
      client_token,
      redirect_url,
      company_name: COMPANY_NAME,
      documents: 'aadhaar,pan',
      other_documents: [
        {
            "doctype": "SSCER",
            "orgid": "000027",
            "consent": "Y",
            "rollno": "17108541",
            "year": "2020"
          },
          {
            "doctype": "SSCER",
            "orgid": "000027",
            "consent": "Y",
            "rollno": "17607984",
            "year": "2022"
          }
      ],
    };

    console.log('Making request to DigiLocker API:', {
      url: 'https://digilocker.meon.co.in/digi_url',
      method: 'POST',
      body: requestBody
    });

    const response = await fetch('https://digilocker.meon.co.in/digi_url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('DigiLocker API Response Status:', response.status);

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

    // Check response based on DigiLocker API format
    if (!response.ok || !data.success || data.code !== 200) {
      return NextResponse.json(
        { 
          error: data.msg || data.error || 'Failed to generate DigiLocker link', 
          success: false,
          code: data.code
        },
        { status: response.status }
      );
    }

    // Return the successful response with the URL
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in generate-link:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

