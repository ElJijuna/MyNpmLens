import type { AppTool } from '@/hooks/useAppTools';

const MAX_TURNS = 3;

const ACTION_SCHEMA = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['answer', 'tool_call'],
      description: '"answer" to reply in text, "tool_call" to invoke one of the listed tools.',
    },
    text: { type: 'string', description: "The reply text. Required when type is 'answer'." },
    tool: {
      type: 'string',
      description: "The tool name to call. Required when type is 'tool_call'.",
    },
    args: {
      type: 'object',
      description:
        "Arguments for the tool, matching its input schema. Required when type is 'tool_call'.",
    },
  },
  required: ['type'],
};

interface ActionResponse {
  type?: 'answer' | 'tool_call';
  text?: string;
  tool?: string;
  args?: Record<string, unknown>;
}

function describeTools(tools: AppTool[]): string {
  return tools
    .map(
      (tool) =>
        `- ${tool.name}: ${tool.description} Input schema: ${JSON.stringify(tool.inputSchema)}`,
    )
    .join('\n');
}

/**
 * Chrome's Prompt API doesn't implement native tool-calling yet
 * (the `tools` option in LanguageModel.create is specified but not
 * functional — see crbug.com/422803232). This emulates it: the model
 * is forced (via responseConstraint) to reply with either a plain
 * answer or a tool_call, which we execute ourselves and feed back in,
 * looping until it produces a final answer.
 */
export async function runAssistantTurn(
  session: LanguageModel,
  prompt: string,
  tools: AppTool[],
  signal?: AbortSignal,
): Promise<string> {
  let nextPrompt =
    tools.length > 0
      ? [
          prompt,
          '',
          '<available-tools>',
          describeTools(tools),
          '</available-tools>',
          'If the user is asking you to perform one of these actions, respond with a tool_call. Otherwise respond with an answer.',
        ].join('\n')
      : prompt;

  for (let turn = 0; turn < MAX_TURNS; turn += 1) {
    const raw = await session.prompt(nextPrompt, { responseConstraint: ACTION_SCHEMA, signal });

    let parsed: ActionResponse;
    try {
      parsed = JSON.parse(raw) as ActionResponse;
    } catch {
      return raw;
    }

    if (parsed.type !== 'tool_call' || !parsed.tool) {
      return parsed.text ?? raw;
    }

    const tool = tools.find((candidate) => candidate.name === parsed.tool);
    if (!tool) {
      nextPrompt = `Tool "${parsed.tool}" does not exist. Reply with a plain answer instead.`;
      continue;
    }

    let result: string;
    try {
      result = await tool.execute(parsed.args ?? {});
    } catch (error) {
      result = `Tool "${tool.name}" failed: ${error instanceof Error ? error.message : String(error)}`;
    }

    nextPrompt = `Tool "${tool.name}" result: ${result}\nNow reply to the user with a final answer describing what happened, in the required response language.`;
  }

  return 'Sorry, I could not complete that request.';
}
