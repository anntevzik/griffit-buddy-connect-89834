import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: `You are a child psychologist specializing in art therapy for children with autism. Analyze this drawing to understand the child's emotional and psychological state.

Consider:
- **Colors used**: What emotions do they represent? (warm colors = excitement/anxiety, cool colors = calm/sadness, bright = energy, dark = heaviness)
- **Shapes and patterns**: Are they chaotic or organized? Sharp or rounded? What does this suggest?
- **Composition**: Is the drawing centered, scattered, or compressed? Does it fill the space or feel confined?
- **Pressure and strokes**: Heavy lines suggest intensity, light lines suggest gentleness or uncertainty
- **Subjects drawn**: What themes or objects appear? What might they symbolize?

Provide a warm, empathetic 3-4 sentence analysis that:
1. Identifies the primary emotions you sense (e.g., joy, anxiety, calmness, creativity, stress)
2. Explains why you sense these emotions based on specific elements in the drawing
3. Offers a supportive insight about what the child might be processing or expressing
4. Ends with an encouraging observation about their emotional expression

Write in a gentle, professional tone that parents will find insightful and supportive.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to analyze drawing');
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
