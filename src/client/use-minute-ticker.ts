'use client';

import { useEffect, useState } from 'react';

/**
 * Single shared 60-second page ticker (§9.1) so relative time-left and overdue
 * labels update live every minute without creating one interval per card.
 */
export function useMinuteTicker(): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000) + 50;
    let intervalId: number | undefined;

    const timeoutId = window.setTimeout(() => {
      setNow(new Date());
      intervalId = window.setInterval(() => {
        setNow(new Date());
      }, 60_000);
    }, msUntilNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  return now;
}
