export function CollaricIcon({ className, mono }: { className?: string, mono?: string }) {
  return (
    <svg
      width="1000"
      height="1000"
      viewBox="0 0 1000 1000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M82 508.815L217.414 379H478V640.908L346 773H82V508.815Z"
        fill={mono? mono : "#788BFF"}
      />
      <path
        d="M912 407.185L776.586 537H516V275.092L648 143H912V407.185Z"
        fill={mono? mono : "#9BB1FF"}
      />
      <path
        d="M516 763.746L612.089 856H797V669.873L703.333 576H516V763.746Z"
        fill={mono? mono : "#E2FDFF"}
      />
    </svg>
  );
}
