import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { learner_id, digilocker_data } = body;

    if (!learner_id || !digilocker_data) {
      return NextResponse.json(
        { error: 'Missing required parameters: learner_id and digilocker_data' },
        { status: 400 }
      );
    }

    // Get authorization token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Save to backend API which will store in MongoDB
    const response = await fetch(`${BACKEND_URL}/api/v1/learners/${learner_id}/digilocker-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        digilocker_data,
        fetched_at: new Date().toISOString(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.detail || 'Failed to save DigiLocker data' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in save-data:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

