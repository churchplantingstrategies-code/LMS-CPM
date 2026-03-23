"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { getInitials } from "../../lib/utils";

type HeaderUserActionsProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  showAvatar?: boolean;
  showBell?: boolean;
};

export function HeaderUserActions({
  name,
  email,
  image,
  showAvatar = true,
  showBell = true,
}: HeaderUserActionsProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {showBell ? (
        <button
          type="button"
          className="relative rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-500 dark:text-slate-300" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-600" />
        </button>
      ) : null}

      {showAvatar ? (
        <Avatar className="h-8 w-8">
          <AvatarImage src={image || ""} />
          <AvatarFallback className="bg-brand-100 text-xs text-brand-700">
            {getInitials(name || email || "U")}
          </AvatarFallback>
        </Avatar>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="gap-1.5"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  );
}
