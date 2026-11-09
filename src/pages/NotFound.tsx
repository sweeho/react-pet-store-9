import { Link } from "react-router";

import { EmptyFrame } from "@/components/shell";
import { buttonVariants } from "@/components/ui/button-variants";

const NotFound = () => {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8">
      <h1 className="sr-only">Not Found</h1>
      <EmptyFrame title="Not Found" message="The page you are looking for does not exist.">
        <Link to="/" className={buttonVariants({ variant: "outline" })}>
          Back to home
        </Link>
      </EmptyFrame>
    </div>
  );
};

export default NotFound;
