import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are a concise, knowledgeable fitness AI coach for an app called Rebuild.

Personality: terse, data-driven, no fluff. Mirror the terminal aesthetic — short lines, no emoji, no filler.

You have access to the user's:
- Recent training history
- Current workout in progress (plain text)
- Weight trend and goal

Your roles:
1. WORKOUT GENERATOR: When asked, create a workout. Return it as plain text, one exercise per line:
   "  exercise name      weight  sets×reps"
   Always lead with a 2–3 line explanation of WHY this session (which muscles are lagging, last session, etc.)
   Close with an equipment note.

2. NATURAL LANGUAGE PARSER: When the user describes what they did or want to change, parse it and return the updated workout text plus a brief confirmation.

3. COACH: Short, direct feedback. Detect PRs, flag stalls, suggest adjustments.

When the user's message modifies the workout, your response JSON must include:
- "reply": your natural language response (2–4 lines max)
- "workoutUpdate": the full updated workout text (or null if no change)

Format workout text with leading spaces for indentation, aligned columns.
Never use markdown, headers, bullets, or emoji.`;

interface ChatResponse {
  reply: string;
  workoutUpdate: string | null;
}

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithClaude(
  userMessage: string,
  currentWorkout: string | null,
  history: HistoryMessage[],
  userContext: string
): Promise<ChatResponse> {
  const contextBlock = [
    userContext,
    currentWorkout ? `\nCurrent workout draft:\n${currentWorkout}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    {
      role: 'user',
      content: `${contextBlock}\n\nUser: ${userMessage}\n\nRespond with valid JSON: {"reply": "...", "workoutUpdate": "..." or null}`,
    },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as ChatResponse;
      return {
        reply: parsed.reply ?? text,
        workoutUpdate: parsed.workoutUpdate ?? null,
      };
    }
  } catch {
    // not JSON — treat entire response as reply
  }

  return { reply: text, workoutUpdate: null };
}

export async function generateWorkout(
  userProfile: {
    experienceLevel?: string;
    currentWeightLbs?: number;
    goalWeightLbs?: number;
  },
  recentSessions: string[],
  request: string
): Promise<{ reply: string; workoutText: string }> {
  const context = [
    `Experience: ${userProfile.experienceLevel ?? 'intermediate'}`,
    userProfile.currentWeightLbs
      ? `Body weight: ${userProfile.currentWeightLbs}lb`
      : '',
    recentSessions.length
      ? `Last ${recentSessions.length} sessions:\n${recentSessions.join('\n')}`
      : 'No recent sessions.',
  ]
    .filter(Boolean)
    .join('\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `${context}\n\nRequest: ${request}\n\nRespond with JSON: {"reply": "2-3 line explanation", "workoutUpdate": "full workout text"}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        reply: string;
        workoutUpdate: string;
      };
      return {
        reply: parsed.reply ?? '',
        workoutText: parsed.workoutUpdate ?? '',
      };
    }
  } catch {
    // fallback
  }

  return { reply: text, workoutText: '' };
}
