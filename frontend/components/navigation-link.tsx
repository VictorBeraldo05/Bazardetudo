"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, MouseEvent } from "react";

import { useNavigationFeedback } from "@/components/navigation-feedback-provider";

type NavigationLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    feedback?: boolean;
  };

export function NavigationLink({
  children,
  onClick,
  feedback = true,
  prefetch = true,
  href,
  ...props
}: NavigationLinkProps) {
  const { startNavigation } = useNavigationFeedback();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || !feedback) {
      return;
    }

    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (typeof props.target === "string" && props.target === "_blank")
    ) {
      return;
    }

    startNavigation(typeof href === "string" ? href : undefined);
  }

  return (
    <Link href={href} prefetch={prefetch} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
