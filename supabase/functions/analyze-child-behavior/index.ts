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

    const { emotionData, foodData, gameData, child_id } = await req.json();
    
    // Validate input
    if (!emotionData || !foodData || !gameData) {
      return new Response(
        JSON.stringify({ error: 'Missing required data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!child_id || typeof child_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid child_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify parent has access to this child
    const { data: childData, error: childError } = await supabaseClient
      .from('children')
      .select('parent_id')
      .eq('id', child_id)
      .single();

    if (childError || !childData) {
      return new Response(
        JSON.stringify({ error: 'Child not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: parentData, error: parentError } = await supabaseClient
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parentData || parentData.id !== childData.parent_id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to child data' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `You are a child psychologist analyzing a child's behavioral patterns. Based on the following data, provide:
1. A psychological portrait of the child (2-3 sentences)
2. Practical advice for parents on how to support this child emotionally (3-4 actionable suggestions)

Data:
- Most frequent emotion: ${emotionData.topEmotion} (${emotionData.count} times in the past 7 days)
- Most chosen food: ${foodData.topFood} (${foodData.count} times)
- Most played game: ${gameData.topGame} (${gameData.count} times)
- Other emotions: ${emotionData.others.join(', ')}

Provide your response in a warm, supportive tone that helps parents understand their child better.

Format your response as JSON:
{
  "portrait": "Your psychological portrait here",
  "advice": ["Advice point 1", "Advice point 2", "Advice point 3"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('Error in analyze-child-behavior:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
