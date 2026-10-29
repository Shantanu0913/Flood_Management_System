import { useState, useCallback, useRef, useEffect } from 'react';

const API_URL = "http://127.0.0.1:8000/api";

export interface Agent {
  id: string;
  type: string;
  x: number;
  y: number;
  state: string;
  logs: string[];
}

export interface Victim {
  id: string;
  x: number;
  y: number;
  severity: string;
  status: string;
}

export interface Resource {
  id: string;
  type: string;
  x: number;
  y: number;
  status: string;
}

export interface SimState {
  status: string;
  grid_size: number;
  grid: number[][];
  agents: Agent[];
  victims: Victim[];
  resources: Resource[];
  stats: {
    time_steps: number;
    rescued_people: number;
    efficiency_score: number;
  };
}

export const useSimulation = () => {
  const [gameState, setGameState] = useState<SimState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const pollInterval = useRef<number | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      const data = await res.json();
      setGameState(data);
      if (data.status === 'running') setIsRunning(true);
      else setIsRunning(false);
    } catch (e) {
      console.error("Failed to fetch simulation status", e);
    }
  }, []);

  const stepSim = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/step`, { method: "POST" });
      const data = await res.json();
      setGameState(data);
    } catch (e) {
      console.error("Failed to step simulation", e);
      stopPolling();
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    pollInterval.current = window.setInterval(stepSim, 500);
  }, [stepSim]);

  const stopPolling = useCallback(() => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    pollInterval.current = null;
  }, []);

  const startSim = useCallback(async (intensity = "medium", gridSize = 20) => {
    try {
      const config = { intensity, grid_size: gridSize };
      const res = await fetch(`${API_URL}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config })
      });
      const data = await res.json();
      setGameState(data.state);
      setIsRunning(true);
      startPolling();
    } catch (e) {
      console.error("Failed to start", e);
    }
  }, [startPolling]);

  const stopSim = useCallback(async () => {
    try {
      await fetch(`${API_URL}/stop`, { method: "POST" });
      setIsRunning(false);
      stopPolling();
      // fetch final state immediately
      fetchState();
    } catch (e) { 
      console.error("Failed to stop", e); 
    }
  }, [stopPolling, fetchState]);

  // Clean up polling on unmount
  useEffect(() => {
    return stopPolling;
  }, [stopPolling]);

  // Initial fetch
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Handle continuing polling if it's already running on mount
  useEffect(() => {
    if (isRunning && !pollInterval.current) {
      startPolling();
    }
  }, [isRunning, startPolling]);

  return {
    gameState,
    isRunning,
    startSim,
    stopSim
  };
};
