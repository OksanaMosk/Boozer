import { useEffect, useRef, useState } from "react";
import IMask from "imask";

export const usePhoneMask = (
  initialValue: string,
  onChange: (value: string) => void
) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const maskRef = useRef<ReturnType<typeof IMask> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!inputRef.current || maskRef.current) return;

    maskRef.current = IMask(inputRef.current, {
      mask: "+{00} (000) 000-00-00",
    });

    maskRef.current.on("accept", () => {
      const value = maskRef.current?.value || "";
      onChange(value);
    });

    return () => {
      maskRef.current?.destroy();
      maskRef.current = null;
    };
  }, [onChange]);

  useEffect(() => {
    if (!maskRef.current) return;
    const maskValue = maskRef.current.value || "";
    if (maskValue !== initialValue) {
      maskRef.current.value = initialValue;
    }
  }, [initialValue]);

  useEffect(() => {
    if (!initialValue) {
      setError("");
      return;
    }
    const re = /^\+\d{2} \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    setError(re.test(initialValue) ? "" : "Phone number must be in format +xx (xxx) xxx-xx-xx");
  }, [initialValue]);

  return { inputRef, error };
};
