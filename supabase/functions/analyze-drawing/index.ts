import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageData, child_id } = await req.json();
    
    // Validate input
    if (!imageData || typeof imageData !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid image data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!child_id || typeof child_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid child_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate image data size (limit to 5MB)
    if (imageData.length > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Image data too large' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify child belongs to authenticated user
    const { data: childData, error: childError } = await supabaseClient
      .from('children')
      .select('user_id')
      .eq('id', child_id)
      .single();

    if (childError || !childData || childData.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to child data' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Load knowledge base: color meanings + professional drawing analyses
    const [{ data: colorMeanings }, { data: drawingRefs }] = await Promise.all([
      supabaseClient.from('color_meanings').select('color_name,hex_value,emotional_meaning,psychological_notes'),
      supabaseClient.from('drawing_references').select('title,description,professional_analysis,tags,source'),
    ]);

    const colorsBlock = (colorMeanings ?? [])
      .map((c: any) => `- ${c.color_name} (${c.hex_value}): ${c.emotional_meaning} | ${c.psychological_notes}`)
      .join('\n');

    const refsBlock = (drawingRefs ?? [])
      .map((r: any, i: number) =>
        `${i + 1}. "${r.title}"\n   აღწერა: ${r.description}\n   ფსიქოლოგის ანალიზი: ${r.professional_analysis}\n   ტეგები: ${(r.tags ?? []).join(', ')}${r.source ? `\n   წყარო: ${r.source}` : ''}`
      )
      .join('\n\n');

    const systemPrompt = `You are a child psychologist specializing in art therapy for children with autism. Analyze the child's drawing using the KNOWLEDGE BASE below as your primary reference. Ground your analysis in this professional knowledge rather than general intuition.

=== KNOWLEDGE BASE — COLOR MEANINGS (Art Therapy Literature) ===
${colorsBlock}

=== KNOWLEDGE BASE — PROFESSIONAL DRAWING ANALYSES (Reference Cases) ===
${refsBlock}

=== YOUR TASK ===
1. Identify which colors dominate the drawing and look up their meanings in the COLOR MEANINGS table above.
2. Identify which reference case(s) from PROFESSIONAL DRAWING ANALYSES most closely match this drawing's composition, color palette, and themes.
3. Write a warm, empathetic analysis in **Georgian (ქართულად)**, 4-5 sentences:
   - Name the primary emotions you detect (e.g. სიხარული, შფოთვა, სიმშვიდე, კრეატიულობა, სევდა).
   - Explain WHY, citing specific colors from the knowledge base and the closest matching reference case by title.
   - Offer a supportive insight about what the child may be processing.
   - End with one encouraging observation.
4. After the analysis, on a new line, add: "📚 დაყრდნობილია: <reference title(s)> + <main color names>"

Use a gentle, professional tone. Never diagnose — only describe likely emotional states.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'გაანალიზე ეს ბავშვის ნახატი ცოდნის ბაზის გამოყენებით.' },
              { type: 'image_url', image_url: { url: imageData } },
            ],
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
