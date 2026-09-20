import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarPost {
  id: string;
  title: string;
  status: string;
  publishedAt?: string;
  updatedAt?: string;
}

interface ContentCalendarProps {
  posts: CalendarPost[];
}

export function ContentCalendar({ posts }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const today = dayjs();

  // Generate 42 days (6 weeks) for the grid
  const daysInGrid = useMemo(() => {
    const startOfMonth = currentDate.startOf('month');
    // day() returns 0 for Sunday, which matches our requirement
    const startDayOfWeek = startOfMonth.day();
    
    // Calculate the first day to show in the grid (might be in the previous month)
    const startDate = startOfMonth.subtract(startDayOfWeek, 'day');
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(startDate.add(i, 'day'));
    }
    return days;
  }, [currentDate]);

  // Map posts to their respective days
  const postsByDate = useMemo(() => {
    const map = new Map<string, CalendarPost[]>();
    posts.forEach(post => {
      // Use publishedAt, fallback to updatedAt
      const dateStr = post.publishedAt || post.updatedAt;
      if (!dateStr) return;
      
      const dayKey = dayjs(dateStr).format('YYYY-MM-DD');
      if (!map.has(dayKey)) map.set(dayKey, []);
      map.get(dayKey)!.push(post);
    });
    return map;
  }, [posts]);

  const handlePrevMonth = () => setCurrentDate(prev => prev.subtract(1, 'month'));
  const handleNextMonth = () => setCurrentDate(prev => prev.add(1, 'month'));
  
  const handleToday = () => {
    const now = dayjs();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const handleDateClick = (day: dayjs.Dayjs) => {
    setSelectedDate(day);
    // If clicking a date from another month, navigate to that month
    if (day.month() !== currentDate.month()) {
      setCurrentDate(day.startOf('month'));
    }
  };

  const selectedDayKey = selectedDate.format('YYYY-MM-DD');
  const selectedDayPosts = postsByDate.get(selectedDayKey) || [];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-hairline-soft flex flex-col h-full min-h-[540px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-ink">Calendar</h2>
        <button 
          onClick={handleToday}
          className="px-3 py-1.5 text-sm font-semibold text-[#1F5132] border border-hairline-strong rounded-lg hover:bg-surface-soft transition-colors"
        >
          Today
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={handlePrevMonth}
          aria-label="Previous month"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-soft text-steel transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-ink text-[15px]">
          {currentDate.format('MMMM YYYY')}
        </span>
        <button 
          onClick={handleNextMonth}
          aria-label="Next month"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-soft text-steel transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 mb-2">
        {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
          <div key={day} className="text-center text-[12px] font-semibold text-steel uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 mb-6">
        {daysInGrid.map((day, i) => {
          const isCurrentMonth = day.month() === currentDate.month();
          const isToday = day.isSame(today, 'day');
          const isSelected = day.isSame(selectedDate, 'day');
          const dayKey = day.format('YYYY-MM-DD');
          const hasPosts = postsByDate.has(dayKey) && postsByDate.get(dayKey)!.length > 0;

          // Determine styles
          let btnClass = "w-full h-[38px] rounded-[10px] flex flex-col items-center justify-center relative transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-green ";
          let textClass = "text-sm ";
          let dotColor = "bg-brand-green";

          if (isSelected) {
            btnClass += "bg-[#1F5132]";
            textClass += "text-white font-bold";
            dotColor = "bg-[#9FCFA7]"; // Light green if selected
          } else if (isToday) {
            btnClass += "bg-[#E3F0E4] hover:bg-[#D1E6D3]";
            textClass += "text-[#1F5132] font-bold";
          } else if (!isCurrentMonth) {
            btnClass += "hover:bg-surface-soft";
            textClass += "text-[#A3AAA4]";
          } else {
            btnClass += "hover:bg-surface-soft";
            textClass += "text-ink font-medium";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleDateClick(day)}
              className={btnClass}
            >
              <span className={textClass}>{day.date()}</span>
              {hasPosts && (
                <span className={`w-[5px] h-[5px] rounded-full absolute bottom-1 ${dotColor}`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="h-px w-full bg-hairline-soft mb-4" />

      {/* Post List */}
      <div className="flex-1 overflow-y-auto min-h-[100px] scrollbar-hide">
        {selectedDayPosts.length > 0 && (
          <div className="space-y-3">
            {selectedDayPosts.map(post => {
              const postTime = dayjs(post.publishedAt || post.updatedAt).format('h:mm A');
              
              // Status formatting
              let statusClasses = "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ";
              if (post.status === 'PUBLISHED') {
                statusClasses += "bg-brand-green-soft text-brand-green-dark";
              } else if (post.status === 'DRAFT') {
                statusClasses += "bg-amber-100 text-amber-700";
              } else {
                statusClasses += "bg-surface text-steel border border-hairline-strong";
              }

              return (
                <div key={post.id} className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-ink line-clamp-1">
                      {post.title}
                    </span>
                    <span className="text-[11px] text-steel mt-0.5">
                      {postTime}
                    </span>
                  </div>
                  <span className={`${statusClasses} shrink-0`}>
                    {post.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary below list */}
      <div className="mt-4 pt-4">
        <p className="text-[13px] font-bold text-ink">
          {selectedDate.format('dddd, MMMM D, YYYY')}
        </p>
        {selectedDayPosts.length > 0 && (
          <p className="text-[12px] text-steel mt-0.5">
            {selectedDayPosts.length} post{selectedDayPosts.length === 1 ? '' : 's'}
          </p>
        )}
      </div>
    </div>
  );
}
