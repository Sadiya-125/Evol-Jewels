import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full bg-transparent border-b-2 px-0 py-2 font-sans text-sm text-evol-dark-grey placeholder:text-evol-metallic focus:outline-none transition-colors duration-200",
          error
            ? "border-evol-red focus:border-evol-red"
            : "border-evol-grey focus:border-evol-red",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
