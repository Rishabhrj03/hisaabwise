import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const userSession = await getSessionUser();

        if (!userSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // In a real "WhatsApp Self Message" flow, the server would receive a webhook from WhatsApp
        // confirming the message was received from the user's number with the correct code.
        // For now, we will simulate this or trust the client's request if we assume the user 
        // sent the message and clicked "I sent it".

        // HOWEVER, to be slightly more secure without a webhook, we could ask the user 
        // to input a code we sent them (OTP), but the request was "Self Message".
        // "Self Message" usually allows the server to verify the SENDER.

        // Strategy for now:
        // We will just verify the user manually here relative to the code.
        // If the user *sends* the code to us, we need a webhook.
        // Since we don't have a webhook, we might have to just "trust" or "mock" it.

        // Let's assume this endpoint is called when the user claims they sent the message.
        // In a real app without webhook, this flow is insecure.
        // We will mark it as verified for this demo.

        const user = await User.findById(userSession.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify code
        const { code } = await req.json();

        if (code !== user.phoneVerificationCode) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
        }

        user.isPhoneVerified = true;
        user.phoneVerificationCode = undefined;
        await user.save();

        return NextResponse.json({ success: true, message: 'Phone verified successfully' });

    } catch (error) {
        console.error('Phone verification error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
