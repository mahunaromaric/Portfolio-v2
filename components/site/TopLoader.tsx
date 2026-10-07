"use client";

import NextTopLoader from "nextjs-toploader";

export function TopLoader() {
  return <NextTopLoader color="var(--accent)" height={2} showSpinner={false} shadow={false} zIndex={9999} />;
}
