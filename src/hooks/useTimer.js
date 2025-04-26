import { useState, useEffect, useRef } from 'react';
import { useTodo } from './useTodo';

export const useTimer = () => {
  const { currentTodo, updateTimeSpent } = useTodo();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerType, setTimerType] = useState('work'); // 'work' or 'break'
  const [workDuration, setWorkDuration] = useState(25 * 60); // 25 minutes in seconds
  const [breakDuration, setBreakDuration] = useState(5 * 60); // 5 minutes in seconds
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio for notification
  useEffect(() => {
    audioRef.current = new Audio();
    // Use the Miku alarm sound (13 seconds duration)
    audioRef.current.src = '/src/assets/sounds/miku-alarm.mp3';
  }, []);

  // Set initial timer duration based on timer type
  useEffect(() => {
    setTimeLeft(timerType === 'work' ? workDuration : breakDuration);
  }, [timerType, workDuration, breakDuration]);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Handle timer completion
  const handleTimerComplete = () => {
    // Play notification sound and ensure it plays completely
    if (audioRef.current) {
      // Reset the audio to the beginning
      audioRef.current.currentTime = 0;

      // Play the audio
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Add an event listener to detect when the audio finishes playing
            const handleAudioEnd = () => {
              audioRef.current.removeEventListener('ended', handleAudioEnd);

              // If work timer completed, update time spent on the current todo
              if (timerType === 'work' && currentTodo) {
                updateTimeSpent(currentTodo.id, workDuration);
              }

              // Switch timer type
              setTimerType(timerType === 'work' ? 'break' : 'work');
            };

            // For Miku alarm which is 13 seconds long
            audioRef.current.addEventListener('ended', handleAudioEnd);

            // Fallback in case the ended event doesn't fire
            // This ensures the timer will eventually switch modes even if there's an issue with the audio
            setTimeout(() => {
              // Only proceed if the audio hasn't already triggered the ended event
              if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleAudioEnd);

                // If work timer completed, update time spent on the current todo
                if (timerType === 'work' && currentTodo) {
                  updateTimeSpent(currentTodo.id, workDuration);
                }

                // Switch timer type
                setTimerType(timerType === 'work' ? 'break' : 'work');
              }
            }, 14000); // 14 seconds (slightly longer than the 13-second audio)
          })
          .catch(error => {
            console.error('Error playing audio:', error);

            // If there's an error playing the audio, still update the timer state
            if (timerType === 'work' && currentTodo) {
              updateTimeSpent(currentTodo.id, workDuration);
            }

            // Switch timer type
            setTimerType(timerType === 'work' ? 'break' : 'work');
          });
      }
    } else {
      // If audio is not available, still update the timer state
      if (timerType === 'work' && currentTodo) {
        updateTimeSpent(currentTodo.id, workDuration);
      }

      // Switch timer type
      setTimerType(timerType === 'work' ? 'break' : 'work');
    }

    // Stop the timer
    setIsRunning(false);
  };

  // Start the timer
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  // Pause the timer
  const pauseTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    }
  };

  // Reset the timer
  const resetTimer = () => {
    pauseTimer();
    setTimeLeft(timerType === 'work' ? workDuration : breakDuration);
  };

  // Set custom durations
  const setCustomWorkDuration = (seconds) => {
    setWorkDuration(seconds);
    if (timerType === 'work') {
      setTimeLeft(seconds);
    }
  };

  const setCustomBreakDuration = (seconds) => {
    setBreakDuration(seconds);
    if (timerType === 'break') {
      setTimeLeft(seconds);
    }
  };

  // Format time for display (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
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
    audioRef, // Expose audioRef for notification state monitoring
  };
};
