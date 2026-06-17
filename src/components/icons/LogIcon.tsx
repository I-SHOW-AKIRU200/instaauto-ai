import { SVGProps } from "react";

export function LogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M14 2v6h6l-6-6zm-2 15H8v-2h4v2zm4-4H8v-2h8v2zm0-4h-2V7h2v2z"
        fill="currentColor"
      />
    </svg>
  );
}
