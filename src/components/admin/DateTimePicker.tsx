'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateTimePickerProps {
  value: string; // ISO string
  onChange: (isoString: string) => void;
  label?: string;
  placeholder?: string;
}

export default function DateTimePicker({
  value,
  onChange,
  label,
  placeholder = 'Select Date & Time',
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Internal state
  const [currentDate, setCurrentDate] = useState(() => {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  });

  const [viewDate, setViewDate] = useState(() => {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  });

  // Keep internal state in sync if value prop changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentDate(d);
        setViewDate(d);
      }
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(viewDate.getFullYear(), viewDate.getMonth(), day);
    setCurrentDate(newDate);
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (type: 'hours' | 'minutes', val: number) => {
    const newDate = new Date(currentDate);
    if (type === 'hours') newDate.setHours(val);
    if (type === 'minutes') newDate.setMinutes(val);
    setCurrentDate(newDate);
    onChange(newDate.toISOString());
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Generate calendar days
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Formatting display
  const displayValue = value && !isNaN(new Date(value).getTime()) 
    ? new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : '';

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</label>}
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white/[0.05] border border-white/10 rounded-md px-3 py-2 text-xs text-left text-white focus:outline-none focus:border-sz-red transition-colors group"
      >
        <span className={displayValue ? 'text-white' : 'text-white/40'}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className={`w-4 h-4 transition-colors ${isOpen ? 'text-sz-red' : 'text-white/30 group-hover:text-white/60'}`} />
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-72 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <button type="button" onClick={prevMonth} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-xs uppercase tracking-widest font-bold text-white">
                {monthNames[month]} {year}
              </div>
              <button type="button" onClick={nextMonth} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-[9px] uppercase tracking-wider text-white/30">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  if (day === null) return <div key={`empty-${idx}`} />;
                  
                  const isSelected = value && 
                    currentDate.getDate() === day && 
                    currentDate.getMonth() === month && 
                    currentDate.getFullYear() === year;

                  const isToday = 
                    new Date().getDate() === day && 
                    new Date().getMonth() === month && 
                    new Date().getFullYear() === year;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`
                        h-8 flex items-center justify-center text-xs rounded transition-all duration-200
                        ${isSelected ? 'bg-sz-red text-white font-bold shadow-[0_0_15px_rgba(255,0,0,0.5)]' : 
                          isToday ? 'border border-sz-red/50 text-sz-red' : 
                          'text-white/70 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Picker */}
            <div className="bg-white/[0.02] border-t border-white/5 p-4 flex items-center justify-center gap-4">
              <Clock className="w-4 h-4 text-white/30" />
              <div className="flex items-center gap-2">
                <select 
                  value={currentDate.getHours()}
                  onChange={(e) => handleTimeChange('hours', parseInt(e.target.value))}
                  className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-sz-red focus:outline-none appearance-none text-center min-w-[3rem]"
                >
                  {Array.from({length: 24}).map((_, i) => (
                    <option key={i} value={i} className="bg-[#0a0a0a]">{i.toString().padStart(2, '0')}</option>
                  ))}
                </select>
                <span className="text-white/30">:</span>
                <select 
                  value={currentDate.getMinutes()}
                  onChange={(e) => handleTimeChange('minutes', parseInt(e.target.value))}
                  className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-sz-red focus:outline-none appearance-none text-center min-w-[3rem]"
                >
                  {Array.from({length: 60}).map((_, i) => (
                    <option key={i} value={i} className="bg-[#0a0a0a]">{i.toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
