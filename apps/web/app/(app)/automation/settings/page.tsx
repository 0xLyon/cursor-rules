"use client";

import { useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  ForwardIcon,
  ShieldAlertIcon,
  MailQuestionIcon,
  NewspaperIcon,
  ArrowLeftIcon,
  PenLineIcon,
} from "lucide-react";
import { AlertBasic } from "@/components/Alert";
import { Input } from "@/components/Input";
import {
  PageHeading,
  SectionDescription,
  TypographyH3,
} from "@/components/Typography";
import { Button, ButtonLoader } from "@/components/ui/button";

const examples = [
  {
    title: "Forward receipts",
    description: "Forward receipts to alice@accountant.com.",
    icon: <ForwardIcon className="h-4 w-4" />,
  },
  {
    title: "Archive and label newsletters",
    description: `Archive newsletters and label them as "Newsletter".`,
    icon: <NewspaperIcon className="h-4 w-4" />,
  },
  {
    title: "Label high priority emails",
    description: `Mark high priority emails as "High Priority". Examples include:
* Customer wants to cancel their plan
* Customer wants to purchase
* Customer complaint`,
    icon: <ShieldAlertIcon className="h-4 w-4" />,
  },
  {
    title: "Respond to question",
    description: `If someone asks how much the premium plan is, respond: "Our premium plan is $10 per month."`,
    icon: <MailQuestionIcon className="h-4 w-4" />,
  },
  {
    title: "Custom rule",
    description: `Set up a custom rule.`,
    icon: <PenLineIcon className="h-4 w-4" />,
  },
];

type Inputs = { prompt?: string };

export default function AutomationSettingsPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = useCallback(async (data) => {
    console.log(
      "🚀 ~ constonSubmit:SubmitHandler<Inputs>=useCallback ~ data:",
      data,
    );
    // const res = await updateProfile(data);
    // if (isErrorMessage(res)) toastError({ description: `` });
    // else toastSuccess({ description: `` });
  }, []);

  return (
    <div>
      <PageHeading className="mt-10 text-center">
        Get started with AI Automation
      </PageHeading>
      <SectionDescription className="text-center">
        Automate your email with AI.
      </SectionDescription>

      <div className="mx-auto mt-16 max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {typeof watch("prompt") === "string" ? (
            <>
              <TypographyH3>Tell the AI what to do</TypographyH3>

              <Input
                type="text"
                as="textarea"
                rows={4}
                name="prompt"
                className="mt-2 min-w-[500px]"
                registerProps={register("prompt")}
                error={errors.prompt}
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setValue("prompt", undefined);
                  }}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <ButtonLoader />}
                  Create Automation
                </Button>
              </div>
            </>
          ) : (
            <>
              <TypographyH3>Choose from an example</TypographyH3>

              <div className="mt-2 space-y-1 text-sm leading-6 text-gray-700">
                {examples.map((example) => {
                  return (
                    <button
                      key={example.title}
                      className="w-full text-left"
                      onClick={() => {
                        setValue("prompt", example.description);
                      }}
                    >
                      <AlertBasic
                        title={example.title}
                        description={example.description}
                        icon={example.icon}
                        className="cursor-pointer hover:bg-gray-100"
                      />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
