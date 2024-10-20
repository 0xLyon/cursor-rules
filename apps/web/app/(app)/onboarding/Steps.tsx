"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SectionDescription, TypographyH3 } from "@/components/Typography";
import { cn } from "@/utils";
import { OnboardingModal } from "@/components/OnboardingModal";

export function Steps({
  selectedStep,
  steps,
}: {
  selectedStep: number | undefined;
  steps: {
    title: string;
    description: string;
    content: React.ReactNode;
    videoId?: string;
    active: boolean;
  }[];
}) {
  const router = useRouter();
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (!selectedStep) return;
    const stepIndex = selectedStep - 1;
    if (stepIndex >= 0 && stepIndex < steps.length) {
      stepRefs.current[stepIndex]?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedStep, steps.length]);

  return (
    <ul role="list" className="space-y-6">
      {steps.map((step, stepIdx) => (
        <li
          key={stepIdx}
          ref={(el) => {
            if (el) stepRefs.current[stepIdx] = el;
          }}
          className="relative flex gap-x-4"
          onClick={
            !step.active
              ? () => {
                  router.replace(`/onboarding?step=${stepIdx + 1}`, {
                    scroll: false,
                  });
                }
              : undefined
          }
        >
          <div
            className={cn(
              stepIdx === steps.length - 1 ? "h-6" : "-bottom-6",
              "absolute left-0 top-0 flex w-6 justify-center",
            )}
          >
            <div className="w-px bg-gray-200" />
          </div>

          <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
          </div>

          <div
            className={cn(
              "flex-1 transition-opacity duration-300 ease-in-out",
              step.active ? "opacity-100" : "pointer-events-none opacity-20",
            )}
          >
            <div className="flex justify-between gap-4">
              <div>
                <TypographyH3>{step.title}</TypographyH3>
                <SectionDescription>{step.description}</SectionDescription>
              </div>

              <div className="flex items-center">
                {step.videoId && (
                  <OnboardingModal
                    title={step.title}
                    description="Watch a quick demo of the full feature in action."
                    videoId={step.videoId}
                    buttonProps={{ variant: "outline" }}
                  />
                )}
              </div>
            </div>
            <div className="mt-4">{step.content}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
