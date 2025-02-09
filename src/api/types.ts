import { z } from "zod";

export const SentryProjectSchema = z.object({
  slug: z.string(),
});
export type SentryProjectT = z.infer<typeof SentryProjectSchema>;

export const SentryIssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  culprit: z.string(),
  permalink: z.string(),
});
export type SentryIssueT = z.infer<typeof SentryIssueSchema>;

// https://zodjs.netlify.app/guide/recursive-types
const literalSchema = z.string();
type Literal = z.infer<typeof literalSchema>;
export type SentryExceptionFrameVarsT =
  | Literal
  | { [key: string]: SentryExceptionFrameVarsT }
  | SentryExceptionFrameVarsT[];
const varsSchema: z.ZodType<SentryExceptionFrameVarsT> = z.lazy(() =>
  z.union([literalSchema, z.array(varsSchema), z.record(varsSchema)])
);
const vars = z.record(z.string(), varsSchema);

const exception = z.object({
  type: z.literal("exception"),
  data: z.object({
    values: z.array(
      z.object({
        type: z.string(),
        value: z.string(),
        stacktrace: z.object({
          frames: z.array(
            z.object({
              absPath: z.string(),
              lineNo: z.number().optional(),
              vars: vars.nullable(),
              inApp: z.boolean().optional(),
            })
          ),
        }),
      })
    ),
  }),
});
export type SentryExceptionFrameT = z.infer<typeof exception>["data"]["values"][number]["stacktrace"]["frames"][number];

const breadcrumbs = z.object({
  type: z.literal("breadcrumbs"),
  data: z.unknown(),
});

const message = z.object({
  type: z.literal("message"),
  data: z.unknown(),
});

export const SentryEventSchema = z.object({
  id: z.string(),
  dateCreated: z.string(),
  entries: z.array(z.discriminatedUnion("type", [exception, breadcrumbs, message])),
  tags: z.array(z.object({ key: z.string(), value: z.string() })),
});
export type SentryEventT = z.infer<typeof SentryEventSchema>;
