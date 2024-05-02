"use client";

import { useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { capitalCase } from "capital-case";
import {
  BookOpenCheckIcon,
  CheckCircle2Icon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { toastError } from "@/components/Toast";
import { LoadingContent } from "@/components/LoadingContent";
import { SlideOverSheet } from "@/components/SlideOverSheet";
import { MessagesResponse } from "@/app/api/google/messages/route";
import { Separator } from "@/components/ui/separator";
import { AlertBasic } from "@/components/Alert";
import { TestRulesMessage } from "@/app/(app)/cold-email-blocker/TestRulesMessage";
import { TestAiActionResponse, testAiAction } from "@/utils/actions";
import { RuleType } from "@prisma/client";

export function TestRules(props: { disabled?: boolean }) {
  return (
    <SlideOverSheet
      title="Test Rules"
      description="Test how your rules perform against real emails."
      content={
        <div className="mt-4">
          <TestRulesContent />
        </div>
      }
    >
      <Button color="white" disabled={props.disabled}>
        <BookOpenCheckIcon className="mr-2 h-4 w-4" />
        Test Rules
      </Button>
    </SlideOverSheet>
  );
}

export function TestRulesContent() {
  const { data, isLoading, error } = useSWR<MessagesResponse>(
    "/api/google/messages",
    {
      keepPreviousData: true,
      dedupingInterval: 1_000,
    },
  );

  const session = useSession();
  const email = session.data?.user.email;

  return (
    <div>
      <TestRulesForm />

      <div className="mt-4">
        <Separator />
      </div>

      <LoadingContent loading={isLoading} error={error}>
        {data && (
          <div>
            {data.messages.map((message) => {
              return (
                <TestRulesContentRow
                  key={message.id}
                  message={message}
                  userEmail={email!}
                />
              );
            })}
          </div>
        )}
      </LoadingContent>
    </div>
  );
}

type TestRulesInputs = { message: string };

const TestRulesForm = () => {
  const [testResult, setTestResult] = useState<TestAiActionResponse>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TestRulesInputs>();

  const onSubmit: SubmitHandler<TestRulesInputs> = useCallback(async (data) => {
    try {
      const testResult = await testAiAction({
        from: "",
        to: "",
        date: "",
        replyTo: "",
        cc: "",
        subject: "",
        textPlain: data.message,
        textHtml: "",
        snippet: data.message,
        threadId: "",
        messageId: "",
        headerMessageId: "",
        references: "",
      });
      setTestResult(testResult);
    } catch (error) {
      console.error(error);
      toastError({
        title: "Error checking email.",
        description: (error as Error).message,
      });
    }
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <Input
          type="text"
          as="textarea"
          rows={3}
          name="message"
          placeholder="Paste in email content or write your own. eg. Receipt from Stripe for $49"
          registerProps={register("message", { required: true })}
          error={errors.message}
        />
        <Button type="submit" loading={isSubmitting}>
          <SparklesIcon className="mr-2 h-4 w-4" />
          Test Rules
        </Button>
      </form>
      {testResult && (
        <div className="mt-4">
          <TestResult response={testResult} />
        </div>
      )}
    </div>
  );
};

function TestRulesContentRow(props: {
  message: MessagesResponse["messages"][number];
  userEmail: string;
}) {
  const { message } = props;

  const [checking, setChecking] = useState(false);
  const [testResult, setTestResult] = useState<TestAiActionResponse>();

  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center justify-between py-2">
        <TestRulesMessage
          from={message.headers.from}
          subject={message.headers.subject}
          snippet={message.snippet?.trim() || ""}
          userEmail={props.userEmail}
        />
        <div className="ml-4">
          <Button
            color="white"
            loading={checking}
            onClick={async () => {
              setChecking(true);

              try {
                const testResult = await testAiAction({
                  from: message.headers.from,
                  to: message.headers.to,
                  date: message.headers.date,
                  replyTo: message.headers["reply-to"],
                  cc: message.headers.cc,
                  subject: message.headers.subject,
                  textPlain: message.textPlain || null,
                  textHtml: message.textHtml || null,
                  snippet: message.snippet || null,
                  threadId: message.threadId || "",
                  messageId: message.id || "",
                  headerMessageId: message.headers["message-id"] || "",
                  references: message.headers.references,
                });
                setTestResult(testResult);
              } catch (error) {
                console.error(error);
                toastError({
                  title: "There was an error testing the email.",
                  description: (error as Error).message,
                });
              }
              setChecking(false);
            }}
          >
            <SparklesIcon className="mr-2 h-4 w-4" />
            Test
          </Button>
        </div>
      </div>
      <div className="pb-4">
        <TestResult response={testResult} />
      </div>
    </div>
  );
}

function TestResult({ response }: { response: TestAiActionResponse }) {
  if (!response) return null;

  if (!response.rule) {
    return (
      <AlertBasic
        variant="destructive"
        title="No rule found"
        description={
          <div className="space-y-2">
            <div>This email does not match any of the rules you have set.</div>
            {!!response.reason && (
              <div>
                <strong>AI reason:</strong> {response.reason}
              </div>
            )}
          </div>
        }
      />
    );
  }

  if (response.actionItems) {
    const MAX_LENGTH = 280;

    const aiGeneratedContent = response.actionItems.map((action, i) => {
      return (
        <div key={i}>
          <strong>{capitalCase(action.type)}</strong>
          {Object.entries(action).map(([key, value]) => {
            if (key === "type" || !value) return null;
            return (
              <div key={key}>
                <strong>{capitalCase(key)}: </strong>
                {value}
              </div>
            );
          })}
        </div>
      );
    });

    return (
      <AlertBasic
        title={`Rule found: "${response.rule.name}"`}
        variant="blue"
        description={
          <div className="mt-4 space-y-4">
            {!!aiGeneratedContent.length && (
              <div>
                <strong>AI generated content: </strong>
                {aiGeneratedContent}
              </div>
            )}
            {!!response.reason && (
              <div>
                <strong>AI reason: </strong>
                {response.reason}
              </div>
            )}
            {response.rule.type === RuleType.AI && (
              <div>
                <strong>Instructions: </strong>
                {response.rule.instructions.substring(0, MAX_LENGTH) +
                  (response.rule.instructions.length < MAX_LENGTH ? "" : "...")}
              </div>
            )}
          </div>
        }
        icon={<CheckCircle2Icon className="h-4 w-4" />}
      />
    );
  }
}
