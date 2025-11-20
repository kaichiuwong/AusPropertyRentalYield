import React, { useCallback, useEffect, useState, useRef } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  onChange: (values: [number, number]) => void;
  value: [number, number];
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  step = 1000,
  onChange,
  value
}) => {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Sync local state with props (e.g. when Reset is clicked in parent)
  useEffect(() => {
    setMinVal(value[0]);
    minValRef.current = value[0];
    setMaxVal(value[1]);
    maxValRef.current = value[1];
  }, [value]);

  // Update the range width and position from the left
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Update the range width from the right
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  return (
    <div className="relative w-full h-8 flex items-center justify-center mt-4 mb-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={(event) => {
          const val = Math.min(Number(event.target.value), maxVal - step);
          setMinVal(val);
          minValRef.current = val;
          onChange([val, maxVal]);
        }}
        className="thumb thumb--left z-[3]"
        style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={(event) => {
          const val = Math.max(Number(event.target.value), minVal + step);
          setMaxVal(val);
          maxValRef.current = val;
          onChange([minVal, val]);
        }}
        className="thumb thumb--right z-[4]"
      />

      <div className="slider relative w-full">
        <div className="slider__track absolute rounded h-1.5 bg-slate-200 dark:bg-slate-700 w-full z-[1]" />
        <div
          ref={range}
          className="slider__range absolute rounded h-1.5 bg-blue-600 dark:bg-blue-500 z-[2]"
        />
      </div>

      <style>{`
        .thumb {
          -webkit-appearance: none;
          -moz-appearance: none; 
          pointer-events: none;
          position: absolute;
          height: 0;
          width: 100%;
          outline: none;
        }

        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: all;
          width: 20px;
          height: 20px;
          -webkit-border-radius: 50%;
          border-radius: 50%;
          background-color: white;
          border: 2px solid #2563eb;
          cursor: grab;
          margin-top: -7px; /* To align with the track */
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: background-color 0.2s, border-color 0.2s;
        }

        .thumb::-moz-range-thumb {
          -webkit-appearance: none;
          pointer-events: all;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: white;
          border: 2px solid #2563eb;
          cursor: grab;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: background-color 0.2s, border-color 0.2s;
        }
        
        .thumb:active::-webkit-slider-thumb {
           cursor: grabbing;
           background-color: #eff6ff;
        }

        /* Dark Mode Styles applied via global class selector on parent */
        .dark .thumb::-webkit-slider-thumb {
          background-color: #1e293b; /* slate-800 */
          border-color: #3b82f6; /* blue-500 */
        }

        .dark .thumb::-moz-range-thumb {
           background-color: #1e293b;
           border-color: #3b82f6;
        }

        .dark .thumb:active::-webkit-slider-thumb {
           background-color: #0f172a; /* slate-900 */
        }
      `}</style>
    </div>
  );
};

export default PriceRangeSlider;