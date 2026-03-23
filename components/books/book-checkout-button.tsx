"use client";

import { useSession } from "next-auth/react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

type BookCheckoutButtonProps = ButtonProps & {
  items: Array<{ bookId: string; quantity: number }>;
  callbackUrl?: string;
};

export function BookCheckoutButton({
  items,
  callbackUrl = "/cart",
  children,
  onClick,
  ...buttonProps
}: BookCheckoutButtonProps) {
  const { data: session } = useSession();

  return (
    <Button
      {...buttonProps}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        if (items.length === 0) {
          toast({ title: "Cart is empty", description: "Add at least one book before checkout." });
          return;
        }

        if (!session?.user) {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
          return;
        }

        try {
          const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: "books", items }),
          });

          const data = (await response.json()) as { url?: string; error?: string };

          if (!response.ok || !data.url) {
            throw new Error(data.error || "Failed to start checkout");
          }

          window.location.href = data.url;
        } catch (error) {
          toast({
            title: "Checkout failed",
            description: error instanceof Error ? error.message : "Unable to start book checkout.",
            variant: "destructive",
          });
        }
      }}
    >
      {children}
    </Button>
  );
}