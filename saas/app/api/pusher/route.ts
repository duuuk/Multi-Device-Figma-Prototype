import Pusher from "pusher";
import { NextResponse } from "next/server";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { channel, event, data } = body;
    
    if (!channel || !event) {
      return NextResponse.json({ error: "Missing channel or event" }, { status: 400 });
    }

    await pusher.trigger(channel, event, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pusher trigger error:", error);
    return NextResponse.json({ error: "Failed to trigger event" }, { status: 500 });
  }
}
