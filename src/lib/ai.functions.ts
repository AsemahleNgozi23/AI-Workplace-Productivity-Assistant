import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const EmailInput = z.object({
  purpose: z.string().min(1),
  recipient: z.string().min(1),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({
        schema: z.object({
          subject: z.string(),
          body: z.string(),
        }),
      }),
      prompt: `Write a ${data.tone.toLowerCase()} email to ${data.recipient} about: ${data.purpose}. Return only the subject line and body.`,
    });

    return output;
  });

const MeetingInput = z.object({
  notes: z.string().min(1),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({
        schema: z.object({
          summary: z.string(),
          decisions: z.array(z.string()),
          actionItems: z.array(z.object({
            task: z.string(),
            owner: z.string().optional(),
          })),
          deadlines: z.array(z.object({
            item: z.string(),
            dueDate: z.string().optional(),
          })),
        }),
      }),
      prompt: `Summarize the following meeting notes. Extract: a concise summary, key decisions made, action items with owners if mentioned, and deadlines with dates if mentioned. Meeting notes:\n\n${data.notes}`,
    });

    return output;
  });

const PlannerInput = z.object({
  tasks: z.string().min(1),
});

export const generatePlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({
        schema: z.object({
          dailySchedule: z.array(z.object({
            time: z.string(),
            task: z.string(),
            priority: z.string(),
          })),
          weeklySchedule: z.array(z.object({
            day: z.string(),
            tasks: z.array(z.string()),
          })),
          priorities: z.array(z.string()),
        }),
      }),
      prompt: `Given these tasks, create a daily and weekly schedule. Include priorities. Tasks: ${data.tasks}`,
    });

    return output;
  });

const ResearchInput = z.object({
  topic: z.string().min(1),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({
        schema: z.object({
          summary: z.string(),
          keyInsights: z.array(z.string()),
          recommendations: z.array(z.string()),
        }),
      }),
      prompt: `Research and summarize the topic: ${data.topic}. Provide a concise summary, key insights, and actionable recommendations.`,
    });

    return output;
  });
