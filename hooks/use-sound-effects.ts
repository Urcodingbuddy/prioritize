"use client";

import { useCallback, useRef, useEffect } from "react";

const CLICK_URL = "/sounds/click.mp3";
const SUCCESS_URL = "/sounds/notification.mp3";

export function useSoundEffects() {
    const clickAudioRef = useRef<HTMLAudioElement | null>(null);
    const successAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize audio objects
        if (typeof window !== "undefined") {
            clickAudioRef.current = new Audio(CLICK_URL);
            clickAudioRef.current.volume = 0.5;
            clickAudioRef.current.preload = "auto";

            successAudioRef.current = new Audio(SUCCESS_URL);
            successAudioRef.current.volume = 0.5;
            successAudioRef.current.preload = "auto";
        }
    }, []);

    const playClick = useCallback(() => {
        if (clickAudioRef.current) {
            if (clickAudioRef.current.paused) {
                clickAudioRef.current.currentTime = 0;
                clickAudioRef.current.play().catch(() => { });
            } else {
                const clone = clickAudioRef.current.cloneNode() as HTMLAudioElement;
                clone.volume = 0.5;
                clone.play().catch(() => { });
            }
        }
    }, []);

    const playSuccess = useCallback(() => {
        if (successAudioRef.current) {
            // Allow overlapping success sounds too, why not
            if (successAudioRef.current.paused) {
                successAudioRef.current.currentTime = 0;
                successAudioRef.current.play().catch(() => { });
            } else {
                const clone = successAudioRef.current.cloneNode() as HTMLAudioElement;
                clone.volume = 0.5;
                clone.play().catch(() => { });
            }
        }
    }, []);

    return { playClick, playSuccess };
}
