import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelineBarProps {
  currentDay: number;
  onDayChange: (day: number) => void;
  isOverAllowance?: boolean;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({ currentDay, onDayChange, isOverAllowance = false }) => {
  const totalDays = 30;
  const daysLeft = Math.max(0, totalDays - currentDay + 1);

  return (
    <section
      aria-label="30-Day Budget Timeline"
      className="w-full bg-white dark:bg-[#111726]/85 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:px-6 shadow-sm backdrop-blur-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Day Indicator */}
        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
          <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
            Day {currentDay} of {totalDays}
          </h2>
          {isOverAllowance && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
              Limit Exceeded
            </span>
          )}
          <div className="flex items-center gap-1 ml-2">
            <button
              type="button"
              onClick={() => onDayChange(Math.max(1, currentDay - 1))}
              disabled={currentDay <= 1}
              aria-label="Previous day"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-violet-500"
              title="Previous day"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onDayChange(Math.min(totalDays, currentDay + 1))}
              disabled={currentDay >= totalDays}
              aria-label="Next day"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-violet-500"
              title="Next day"
            >
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Center: Draggable Interactive Timeline Slider */}
        <div className="flex-1 max-w-xl mx-0 sm:mx-6 flex items-center gap-3">
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min={1}
              max={totalDays}
              value={currentDay}
              aria-label="30-Day Timeline Slider"
              aria-valuemin={1}
              aria-valuemax={30}
              aria-valuenow={currentDay}
              aria-valuetext={`Day ${currentDay} of 30, ${daysLeft} days left`}
              onChange={(e) => onDayChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              style={{
                background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${
                  ((currentDay - 1) / (totalDays - 1)) * 100
                }%, ${document.documentElement.classList.contains('dark') ? '#1E293B' : '#E2E8F0'} ${
                  ((currentDay - 1) / (totalDays - 1)) * 100
                }%, ${document.documentElement.classList.contains('dark') ? '#1E293B' : '#E2E8F0'} 100%)`,
              }}
            />
          </div>
        </div>

        {/* Right: Days Left Badge */}
        <div className="text-right">
          <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            <strong className="text-violet-600 dark:text-violet-400 font-bold tabular-nums">{daysLeft}</strong> days left
          </span>
        </div>
      </div>
    </section>
  );
};
