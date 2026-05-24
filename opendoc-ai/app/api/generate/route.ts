import { NextRequest } from 'next/server';
import { generateDocumentationStream } from '@/lib/gemini';
import { checkRateLimit, incrementUsage } from '@/lib/usage';
import { getServerClient } from '@/lib/supabase-server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { repoInfo, tree, priorityFiles } = await req.json();

    if (!repoInfo || !tree || !priorityFiles) {
      return new Response(JSON.stringify({ error: 'Missing required data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit();
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Vượt quá hạn mức sử dụng (10 lượt/ngày). Vui lòng quay lại sau.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user-configured API key
    let userApiKey = undefined;
    if (user) {
      const { data: config } = await supabase
        .from('user_configs')
        .select('gemini_api_key')
        .eq('user_id', user.id)
        .single();

      if (config?.gemini_api_key) {
        userApiKey = config.gemini_api_key;
      }
    }

    if (!userApiKey && !process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Gemini API key is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = await generateDocumentationStream(repoInfo, tree, priorityFiles, userApiKey);

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
          // Increment usage after successful stream start/completion
          await incrementUsage();
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
