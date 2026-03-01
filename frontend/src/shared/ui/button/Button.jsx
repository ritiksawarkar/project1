import { cn } from "../../lib/utils.js";
import { buttonVariants } from "./buttonVariants.js";

function Button({ className, variant, size, type = "button", ...props }) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button };
