"use client";

import { useState } from "react";
import { InfoIcon, SparklesIcon, TagsIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TypographyH4 } from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { senderCategory } from "@/utils/categories";
import { createCategoriesAction } from "@/utils/actions/categorize";
import { cn } from "@/utils";
import { Category } from "@prisma/client";
import { categorizeSendersAction } from "@/utils/actions/categorize";
import { toast } from "sonner";
import { handleActionCall } from "@/utils/server-action";
import { isActionError } from "@/utils/error";
import { Tooltip } from "@/components/Tooltip";

export function SetUpCategories({
  userCategories,
}: {
  userCategories: Category[];
}) {
  const [categories, setCategories] = useState<Map<string, boolean>>(
    new Map(Object.values(senderCategory).map((c) => [c.label, c.enabled])),
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Set up categories</CardTitle>
        <CardDescription>
          Categorize your email senders to make your inbox easier to manage.
        </CardDescription>
        <CardDescription>
          This makes the AI assistant more accurate and predictable, and allows
          you to bulk archive emails from many senders at once.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {userCategories.length === 0 ? (
          <>
            <TypographyH4>Select categories</TypographyH4>

            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from(categories.entries()).map(
                ([category, isSelected]) => {
                  const description = Object.values(senderCategory).find(
                    (c) => c.label === category,
                  )?.description;

                  return (
                    <Card
                      key={category}
                      className={cn(
                        "flex items-center justify-between p-2",
                        !isSelected && "opacity-25",
                      )}
                    >
                      <span className="mr-2 flex items-center gap-2 text-sm">
                        {category}

                        {description && (
                          <Tooltip content={description}>
                            <InfoIcon className="size-4" />
                          </Tooltip>
                        )}
                      </span>
                      {isSelected ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setCategories(
                              new Map(categories.entries()).set(
                                category,
                                false,
                              ),
                            )
                          }
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            setCategories(
                              new Map(categories.entries()).set(category, true),
                            )
                          }
                        >
                          Add
                        </Button>
                      )}
                    </Card>
                  );
                },
              )}
            </div>

            <div className="mt-4">
              <Button
                loading={isCreating}
                onClick={async () => {
                  setIsCreating(true);
                  const selectedCategories = Array.from(categories.entries())
                    .filter(([, isSelected]) => isSelected)
                    .map(([category]) => category);
                  await createCategoriesAction(selectedCategories);
                  setIsCreating(false);
                }}
              >
                <TagsIcon className="mr-2 h-4 w-4" />
                Create Categories
              </Button>
            </div>
          </>
        ) : (
          <div>
            <Button
              type="button"
              disabled={isCategorizing}
              onClick={async () => {
                if (isCategorizing) return;
                toast.promise(
                  async () => {
                    setIsCategorizing(true);
                    const result = await handleActionCall(
                      "categorizeSendersAction",
                      categorizeSendersAction,
                    );

                    if (isActionError(result)) {
                      setIsCategorizing(false);
                      throw new Error(result.error);
                    }

                    setIsCategorizing(false);

                    return result;
                  },
                  {
                    loading: "Categorizing senders...",
                    success: () => {
                      return "Senders categorized successfully!";
                    },
                    error: (err) => {
                      return `Error categorizing senders: ${err.message}`;
                    },
                  },
                );
              }}
              loading={isCategorizing}
            >
              <SparklesIcon className="mr-2 size-4" />
              Categorize Senders with AI
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
