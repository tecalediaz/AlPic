"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "bg-card border border-border text-foreground",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-white",
          cancelButton: "bg-muted text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
