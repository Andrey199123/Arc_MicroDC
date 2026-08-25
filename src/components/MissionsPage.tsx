import React from 'react';
import { motion } from 'framer-motion';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CurrentMissions } from './galaxy/CurrentMissions';
import { GoalsService } from '../services';
import { Button } from './ui/button';
import { Rocket, Target } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';

interface OutletContext {
  setSelectedGoalId: (id: Id<"goals"> | null) => void;
  missions: any[];
  selectedCategory: string | null;
  setShowLaunchModal: (show: boolean) => void;
}

export function MissionsPage() {
  const { setSelectedGoalId, missions, selectedCategory, setShowLaunchModal } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const activeGoals = GoalsService.useList('active');

  const handleGoalSelect = (goalId: Id<"goals">) => {
    setSelectedGoalId(goalId);
  };

  // Filter missions by selected category
  const filteredMissions = selectedCategory 
    ? missions.filter(m => m.category === selectedCategory)
    : missions;

  const activeMissions = filteredMissions.filter(m => m.status === 'active');

  if (activeMissions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <div className="glass-panel rounded-2xl p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-cyan)] flex items-center justify-center"
          >
            <Target className="w-12 h-12 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Current Missions
          </h2>
          
          <p className="text-lg text-white/70 mb-8 max-w-md mx-auto">
            No missions yet. Launch your first mission to start achieving your goals!
          </p>
          
          <Button
            onClick={() => setShowLaunchModal(true)}
            className="arc-primary-gradient text-white font-semibold border-0 px-6"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Launch Mission
          </Button>

          <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              What are missions?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="glass-panel rounded-lg p-4">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="text-sm font-semibold text-white mb-1">Set Goals</h4>
                <p className="text-xs text-white/60">Define what you want to achieve</p>
              </div>
              <div className="glass-panel rounded-lg p-4">
                <div className="text-2xl mb-2">📋</div>
                <h4 className="text-sm font-semibold text-white mb-1">Break Down Tasks</h4>
                <p className="text-xs text-white/60">Create manageable action steps</p>
              </div>
              <div className="glass-panel rounded-lg p-4">
                <div className="text-2xl mb-2">⭐</div>
                <h4 className="text-sm font-semibold text-white mb-1">Track Progress</h4>
                <p className="text-xs text-white/60">Monitor your journey to success</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <CurrentMissions onMissionSelect={handleGoalSelect} />
    </motion.div>
  );
}

