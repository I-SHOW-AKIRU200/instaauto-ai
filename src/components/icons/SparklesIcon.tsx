import { SVGProps } from "react";

export function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10 2l1.83 4.17L16 8l-4.17 1.83L10 14l-1.83-4.17L4 8l4.17-1.83L10 2z"
        fill="currentColor"
      />
      <path
        d="M18 10l.82 1.82L20.5 12.5l-1.68.68L18 15l-.82-1.82L15.5 12.5l1.68-.68L18 10z"
        fill="currentColor"
      />
      <path
        d="M13 16l.55 1.22L14.78 18l-1.23.55L13 19.78l-.55-1.23L11.22 18l1.23-.55L13 16z"
        fill="currentColor"
      />
    </svg>
  );
}
