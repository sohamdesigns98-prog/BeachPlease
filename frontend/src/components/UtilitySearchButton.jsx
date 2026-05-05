import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function UtilitySearchButton({ onClick }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="utility-search-button"
      onClick={onClick}
      aria-label="Search"
    >
      <Search aria-hidden="true" strokeWidth={1.6} />
    </Button>
  );
}
