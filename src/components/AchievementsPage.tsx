import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Zap, Target, Flame, CheckCircle2, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const iconMap: Record<string, React.ElementType> = {
  award: Award,
  star: Star,
  zap: Zap,
  target: Target,
  trophy: Trophy,
  flame: Flame,
};

const colorMap: Record<string, string> = {
  award: 'var(--accent-cyan)',
  star: 'var(--accent-violet)',
  zap: 'var(--warning)',
  target: 'var(--accent-cyan)',
  trophy: 'var(--warning)',
  flame: '#ff6b35',
};

// Mirror of ACHIEVEMENT_DEFINITIONS in convex/achievements.ts.
// Kept in sync manually so the UI can show locked achievements + how to earn them.
const ALL_ACHIEVEMENTS = [
  { title: "First Mission", description: "Completed your first goal", icon: "award" },
  { title: "7-Day Streak", description: "Maintained a 7-day streak", icon: "star" },
  { title: "Century Club", description: "Completed 100 tasks", icon: "zap" },
  { title: "Goal Getter", description: "Completed 5 goals", icon: "target" },
  { title: "Mission Master", description: "Completed 10 goals", icon: "trophy" },
  { title: "Monthly Warrior", description: "Maintained a 30-day streak", icon: "flame" },
];

function LockedAchievementCard({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: string;
  index: number;
}) {
  const IconComponent = iconMap[icon] || Award;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="glass-panel rounded-xl p-4 opacity-60 border border-white/5"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center relative flex-shrink-0">
          <IconComponent className="w-6 h-6 text-white/40" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black/50 border border-white/10 flex items-center justify-center">
            <Lock className="w-3 h-3 text-white/60" />
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="text-white/70 font-medium">{title}</h3>
          <p className="text-xs text-white/40">How to earn: {description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function AchievementsPage() {
  const navigate = useNavigate();
  const achievements = useQuery(api.achievements.getUserAchievements) || [];
  const completedGoals = useQuery(api.goals.getUserGoals, { status: "completed" }) || [];

  const earnedTitles = new Set(achievements.map((a) => a.title));
  const lockedAchievements = ALL_ACHIEVEMENTS.filter((a) => !earnedTitles.has(a.title));

  const hasContent = achievements.length > 0 || completedGoals.length > 0;

  if (!hasContent) {
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
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Achievements Deck
          </h2>
          
          <p className="text-lg text-white/70 mb-8 max-w-md mx-auto">
            No achievements yet. Complete your first mission to unlock achievements and start building your legacy!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <Button
              onClick={() => navigate('/missions')}
              className="arc-primary-gradient text-white font-semibold border-0 px-6"
            >
              <Target className="w-4 h-4 mr-2" />
              View Missions
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-6">
              Available Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {ALL_ACHIEVEMENTS.map((a, index) => (
                <LockedAchievementCard
                  key={a.title}
                  title={a.title}
                  description={a.description}
                  icon={a.icon}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <Trophy className="w-8 h-8 text-[var(--accent-cyan)]" />
          <div>
            <h1 className="text-3xl font-bold text-white">Achievements Deck</h1>
            <p className="text-white/60">
              {completedGoals.length} mission{completedGoals.length !== 1 ? 's' : ''} completed
              {achievements.length > 0 && ` · ${achievements.length} badge${achievements.length !== 1 ? 's' : ''} earned`}
            </p>
          </div>
        </div>
      </div>

      {/* Completed Goals Section */}
      {completedGoals.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Completed Missions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal, index) => (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-panel rounded-xl p-4 border border-green-500/20 bg-green-500/5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{goal.title}</h3>
                    <p className="text-sm text-white/50 truncate">{goal.description}</p>
                    {goal.completedAt && (
                      <p className="text-xs text-green-400/70 mt-1">
                        Completed {new Date(goal.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Badges Section */}
      {achievements.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--accent-cyan)]" />
            Badges Earned
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const IconComponent = iconMap[achievement.icon] || Award;
              const iconColor = colorMap[achievement.icon] || 'var(--accent-cyan)';
              
              return (
                <motion.div
                  key={achievement._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-panel rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <IconComponent className="w-6 h-6" style={{ color: iconColor }} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{achievement.title}</h3>
                      <p className="text-xs text-white/50">{achievement.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked / Upcoming Achievements Section */}
      {lockedAchievements.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
            <Lock className="w-5 h-5 text-white/50" />
            Locked Achievements
          </h2>
          <p className="text-sm text-white/50 mb-4">Keep going to unlock these.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((a, index) => (
              <LockedAchievementCard
                key={a.title}
                title={a.title}
                description={a.description}
                icon={a.icon}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
