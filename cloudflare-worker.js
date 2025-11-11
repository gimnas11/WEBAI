// Cloudflare Worker untuk proxy API calls
// Deploy ke Cloudflare Workers (gratis)

export default {
  async fetch(request, env) {
    // CORS headers - Allow requests from any origin
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };
    
    if (origin) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    } else {
      corsHeaders['Access-Control-Allow-Origin'] = '*';
    }

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      const { messages, provider = 'groq' } = await request.json();

      if (!messages || !Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: 'Invalid messages format' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Get API key from environment variable (set di Cloudflare Workers dashboard)
      const apiKey = provider === 'groq' 
        ? env.GROQ_API_KEY 
        : env.OPENAI_API_KEY;

      if (!apiKey) {
        return new Response(
          JSON.stringify({ 
            error: 'API key not configured. Please set GROQ_API_KEY or OPENAI_API_KEY environment variable.' 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Determine API URL and model
      const apiUrl = provider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const model = provider === 'groq'
        ? 'llama-3.1-8b-instant'
        : 'gpt-4o';

      // Forward request to Groq/OpenAI API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return new Response(
          JSON.stringify({
            error: errorData.error?.message || `API Error: ${response.status} ${response.statusText}`
          }),
          {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Stream the response
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = '';

      // Stream processing
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  await writer.write(encoder.encode('data: [DONE]\n\n'));
                  await writer.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content || '';
                  if (delta) {
                    await writer.write(
                      encoder.encode(`data: ${JSON.stringify({ content: delta, done: false })}\n\n`)
                    );
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
          await writer.write(encoder.encode('data: [DONE]\n\n'));
          await writer.close();
        } catch (error) {
          await writer.abort(error);
        }
      })();

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(
        JSON.stringify({
          error: error.message || 'Internal server error'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};

