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

    // Try to load the Miku alarm sound
    try {
      // Use the Miku alarm sound (13 seconds duration)
      // Fix path to use relative import with Vite
      const audioPath = new URL('../assets/sounds/miku-alarm.mp3', import.meta.url).href;
      audioRef.current.src = audioPath;

      // Preload the audio
      audioRef.current.load();

      console.log('Trying to load audio from:', audioPath);

      // Add error handling for audio loading
      audioRef.current.onerror = (e) => {
        console.error('Error loading audio file:', e);
        // Try fallback to notification sound
        try {
          audioRef.current.src = new URL('../assets/sounds/notification.mp3', import.meta.url).href;
          audioRef.current.load();
        } catch (fallbackError) {
          console.error('Error loading fallback audio:', fallbackError);
        }
      };
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
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
    // Function to handle timer completion regardless of audio status
    const completeTimer = () => {
      // If work timer completed, update time spent on the current todo
      if (timerType === 'work' && currentTodo) {
        updateTimeSpent(currentTodo.id, workDuration);
      }

      // Switch timer type
      setTimerType(timerType === 'work' ? 'break' : 'work');

      // Stop the timer
      setIsRunning(false);
    };

    // Try to play notification sound
    try {
      if (audioRef.current) {
        // Check if the audio file is actually loaded
        if (audioRef.current.readyState === 0) {
          console.warn('Audio file not loaded yet, trying to reload...');
          // Try to reload the audio file
          audioRef.current.src = new URL('../assets/sounds/miku-alarm.mp3', import.meta.url).href;
          // If still not loaded, use fallback
          if (audioRef.current.readyState === 0) {
            console.warn('Could not load audio file, using fallback notification');
            completeTimer();
            return;
          }
        }

        // Reset the audio to the beginning
        audioRef.current.currentTime = 0;

        // Play the audio
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playing successfully');

              // Add an event listener to detect when the audio finishes playing
              const handleAudioEnd = () => {
                console.log('Audio playback completed');
                audioRef.current.removeEventListener('ended', handleAudioEnd);
                completeTimer();
              };

              // For Miku alarm which is 13 seconds long
              audioRef.current.addEventListener('ended', handleAudioEnd);

              // Fallback in case the ended event doesn't fire
              // This ensures the timer will eventually switch modes even if there's an issue with the audio
              setTimeout(() => {
                // Only proceed if the audio hasn't already triggered the ended event
                if (audioRef.current) {
                  console.log('Audio fallback timeout triggered');
                  audioRef.current.removeEventListener('ended', handleAudioEnd);
                  completeTimer();
                }
              }, 14000); // 14 seconds (slightly longer than the 13-second audio)
            })
            .catch(error => {
              console.error('Error playing audio:', error);

              // Try with a system beep as fallback
              try {
                const beep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + Array(1000).join('123'));
                beep.play().catch(e => console.error('Even beep failed:', e));
              } catch (beepError) {
                console.error('Failed to play fallback beep:', beepError);
              }

              completeTimer();
            });
        } else {
          console.warn('Audio play returned undefined promise');
          completeTimer();
        }
      } else {
        console.warn('Audio reference not available');
        completeTimer();
      }
    } catch (error) {
      console.error('Unexpected error in audio handling:', error);
      completeTimer();
    }
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
