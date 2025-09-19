// src/components/ui/DSButton.tsx
import React from "react";
import "./DSButton.css";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost";
};
export default function DSButton({ variant = "default", className, ...rest }: Props) {
  return <button className={`ds-btn ${variant} ${className || ""}`} {...rest} />;
}