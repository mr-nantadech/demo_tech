"use client";

import NextLink from "next/link";
import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";

type LinkButtonProps = Omit<ButtonProps, "component" | "href"> & {
  href: string;
};

/**
 * MUI Button using Next.js Link for client-side navigation.
 * Must be a Client Component — cannot be used with component={Link} in Server Components.
 */
export default function LinkButton({ href, children, ...props }: LinkButtonProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = NextLink as any;
  return (
    <Button component={Comp} href={href} {...props}>
      {children}
    </Button>
  );
}
