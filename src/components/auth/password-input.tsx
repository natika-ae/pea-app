"use client";

import { useState } from "react";
import { inputClass } from "./form-parts";

// Password field with a show/hide toggle (spec 003 §3).
export function PasswordInput(
  props: Omit<React.ComponentProps<"input">, "type"> & { id: string },
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label="แสดงรหัสผ่าน"
        aria-pressed={visible}
        aria-controls={props.id}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-zinc-500 hover:text-purple-900 focus-visible:outline-2 focus-visible:outline-purple-700"
      >
        <svg
          className="size-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
          />
          <circle cx="12" cy="12" r="3" />
          {visible && <path strokeLinecap="round" d="M4 4l16 16" />}
        </svg>
      </button>
    </div>
  );
}
