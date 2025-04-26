import { useState, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import { useTodo } from '../hooks/useTodo';
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaCog,
  FaVolumeUp,
  FaHourglass,
  FaCoffee,
  FaSave,
  FaTimes,
  FaClock,
  FaTasks
} from 'react-icons/fa';

const Timer = () => {
  const {
    timeLeft,
    isRunning,
    timerType,
    workDuration,
    breakDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    setCustomWorkDuration,
    setCustomBreakDuration,
    formatTime,
    audioRef
  } = useTimer();

  const { currentTodo } = useTodo();
  const [isNotificationPlaying, setIsNotificationPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(Math.floor(workDuration / 60));
  const [workSeconds, setWorkSeconds] = useState(workDuration % 60);
  const [breakMinutes, setBreakMinutes] = useState(Math.floor(breakDuration / 60));
  const [breakSeconds, setBreakSeconds] = useState(breakDuration % 60);

  const handleWorkMinutesChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 60) {
      setWorkMinutes(value);
    }
  };

  const handleWorkSecondsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value < 60) {
      setWorkSeconds(value);
    }
  };

  const handleBreakMinutesChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 30) {
      setBreakMinutes(value);
    }
  };

  const handleBreakSecondsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value < 60) {
      setBreakSeconds(value);
    }
  };

  const saveSettings = () => {
    // Ensure at least 1 second total duration
    const workTotalSeconds = (workMinutes * 60) + workSeconds;
    const breakTotalSeconds = (breakMinutes * 60) + breakSeconds;

    setCustomWorkDuration(workTotalSeconds > 0 ? workTotalSeconds : 1);
    setCustomBreakDuration(breakTotalSeconds > 0 ? breakTotalSeconds : 1);
    setShowSettings(false);
  };

  // Monitor audio playback state
  useEffect(() => {
    if (!audioRef.current) return;

    const handlePlay = () => setIsNotificationPlaying(true);
    const handleEnded = () => setIsNotificationPlaying(false);
    const handlePause = () => setIsNotificationPlaying(false);

    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.addEventListener('ended', handleEnded);
    audioRef.current.addEventListener('pause', handlePause);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('pause', handlePause);
      }
    };
  }, [audioRef]);

  const getProgressPercentage = () => {
    const totalDuration = timerType === 'work' ? workDuration : breakDuration;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  return (
    <div className="timer-container">
      <div className="timer-header">
        <h2>
          {timerType === 'work'
            ? <><FaHourglass /> Work Timer</>
            : <><FaCoffee /> Break Timer</>
          }
        </h2>
        <button
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          title="Timer Settings"
          aria-label="Timer Settings"
        >
          <FaCog />
        </button>
      </div>

      {showSettings ? (
        <div className="timer-settings">
          <div className="setting-group">
            <label>Work Duration:</label>
            <div className="time-inputs">
              <div className="time-input-group">
                <input
                  type="number"
                  id="workMinutes"
                  min="0"
                  max="60"
                  value={workMinutes}
                  onChange={handleWorkMinutesChange}
                />
                <label htmlFor="workMinutes">minutes</label>
              </div>
              <div className="time-input-group">
                <input
                  type="number"
                  id="workSeconds"
                  min="0"
                  max="59"
                  value={workSeconds}
                  onChange={handleWorkSecondsChange}
                />
                <label htmlFor="workSeconds">seconds</label>
              </div>
            </div>
          </div>
          <div className="setting-group">
            <label>Break Duration:</label>
            <div className="time-inputs">
              <div className="time-input-group">
                <input
                  type="number"
                  id="breakMinutes"
                  min="0"
                  max="30"
                  value={breakMinutes}
                  onChange={handleBreakMinutesChange}
                />
                <label htmlFor="breakMinutes">minutes</label>
              </div>
              <div className="time-input-group">
                <input
                  type="number"
                  id="breakSeconds"
                  min="0"
                  max="59"
                  value={breakSeconds}
                  onChange={handleBreakSecondsChange}
                />
                <label htmlFor="breakSeconds">seconds</label>
              </div>
            </div>
          </div>
          <div className="settings-actions">
            <button onClick={saveSettings} className="save-settings-btn">
              <FaSave /> Save
            </button>
            <button onClick={() => setShowSettings(false)} className="cancel-settings-btn">
              <FaTimes /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="timer-display">
            <div className="timer-progress-container">
              <div
                className="timer-progress-bar"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="timer-time-container">
              <div className="timer-time">{formatTime(timeLeft)}</div>
              {isNotificationPlaying && (
                <div className="notification-indicator">
                  <FaVolumeUp className="notification-icon pulse" />
                  <span>Playing alarm sound...</span>
                </div>
              )}
            </div>
          </div>

          <div className="current-task">
            {currentTodo ? (
              <div className="task-info">
                <span className="task-label"><FaTasks /> Current Task:</span>
                <span className="task-title">{currentTodo.title}</span>
              </div>
            ) : (
              <div className="no-task">
                <FaClock />
                <span>No task selected. Select a task from the list to start tracking time.</span>
              </div>
            )}
          </div>

          <div className="timer-controls">
            {isRunning ? (
              <button onClick={pauseTimer} className="timer-btn pause-btn">
                <FaPause /> Pause
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="timer-btn start-btn"
                disabled={!currentTodo && timerType === 'work'}
              >
                <FaPlay /> Start
              </button>
            )}
            <button onClick={resetTimer} className="timer-btn reset-btn">
              <FaRedo /> Reset
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Timer;
