import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import useStore from '../../../store/useStore';

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { widgets } = useStore();
  const { format24h } = widgets.clock;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeFormat = format24h ? 'HH:mm:ss' : 'hh:mm:ss a';
  const dateFormat = 'yyyy年MM月dd日 EEEE';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center">
      <div
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-2"
        style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)' }}
      >
        {format(currentTime, timeFormat)}
      </div>
      <div
        className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300"
        style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)' }}
      >
        {format(currentTime, dateFormat, { locale: zhCN })}
      </div>
    </div>
  );
};

export default Clock;
