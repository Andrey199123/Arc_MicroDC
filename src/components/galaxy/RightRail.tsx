import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Rocket,
} from "lucide-react";
import {
  differenceInCalendarDays,
  format,
  isToday,
  isTomorrow,
  parseISO,
} from "date-fns";
import { Id } from "../../../convex/_generated/dataModel";
import { GoalsService, MilestonesService, TasksService } from "../../services";
import { CheckInPrompt } from "../GoalCheckIn";
import { DailyQuote } from "../DailyQuote";

type RightRailProps = {
  missions: any[];
  tasks: any[];
  user: any;
  onLaunchClick: () => void;
  onMissionSelect?: (goalId: Id<"goals">) => void;
};

type ReminderItem = {
  milestoneId: Id<"milestones">;
  goalId: Id<"goals">;
  goalTitle: string;
  milestoneTitle: string;
  deadline: string;
  daysUntil: number;
};

function getDueLabel(daysUntil: number) {
  if (daysUntil < 0) {
    const overdueDays = Math.abs(daysUntil);
    return overdueDays === 1 ? "Overdue by 1 day" : `Overdue by ${overdueDays} days`;
  }

  if (daysUntil === 0) {
    return "Due today";
  }

  if (daysUntil === 1) {
    return "Due tomorrow";
  }

  return `Due in ${daysUntil} days`;
}

export function RightRail({
  missions,
  tasks,
  user,
  onLaunchClick,
  onMissionSelect,
}: RightRailProps) {
  const navigate = useNavigate();
  // Fetch all data for progress calculations
  const allTasks = TasksService.useGetAll();
  const allMilestones = MilestonesService.useGetAll();
  const activeGoals = GoalsService.useList("active");
  const completedGoals = GoalsService.useList("completed");

  const goalTitles = useMemo(() => {
    return new Map(
      [...(activeGoals || []), ...(completedGoals || [])].map((goal) => [goal._id, goal.title] as const),
    );
  }, [activeGoals, completedGoals]);

  const progressStats = useMemo(() => {
    // All Goals: overall goal completion rate
    const allGoals = [...(activeGoals || []), ...(completedGoals || [])];
    const totalGoals = allGoals.length;
    const goalsCompleted = completedGoals?.length || 0;
    const goalsProgress = totalGoals > 0
      ? (goalsCompleted / totalGoals) * 100
      : 0;

    // All Milestones: overall milestone completion rate
    const totalMilestones = allMilestones?.length || 0;
    const milestonesCompleted = allMilestones?.filter((m) => m.status === "completed").length || 0;
    const milestonesProgress = totalMilestones > 0
      ? (milestonesCompleted / totalMilestones) * 100
      : 0;

    // All Tasks: overall task completion rate
    const totalTasks = allTasks?.length || 0;
    const tasksCompleted = allTasks?.filter((t) => t.completed).length || 0;
    const tasksProgress = totalTasks > 0
      ? (tasksCompleted / totalTasks) * 100
      : 0;

    // Overall Progress: weighted average (goals 50%, milestones 30%, tasks 20%)
    const overallProgress = totalGoals > 0 || totalMilestones > 0 || totalTasks > 0
      ? (goalsProgress * 0.5) + (milestonesProgress * 0.3) + (tasksProgress * 0.2)
      : 0;

    return {
      goalsProgress,
      milestonesProgress,
      tasksProgress,
      overallProgress,
    };
  }, [allTasks, allMilestones, activeGoals, completedGoals]);

  const upcomingMilestones = useMemo<ReminderItem[]>(() => {
    return (allMilestones || [])
      .filter((milestone) => milestone.status === "active" && milestone.deadline)
      .map((milestone) => {
        const deadlineDate = parseISO(milestone.deadline as string);

        if (Number.isNaN(deadlineDate.getTime())) {
          return null;
        }

        return {
          milestoneId: milestone._id,
          goalId: milestone.goalId,
          goalTitle: goalTitles.get(milestone.goalId) || "Mission",
          milestoneTitle: milestone.title,
          deadline: milestone.deadline as string,
          daysUntil: differenceInCalendarDays(deadlineDate, new Date()),
        };
      })
      .filter((item): item is ReminderItem => item !== null)
      .filter((item) => item.daysUntil <= 14)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 4);
  }, [allMilestones, goalTitles]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Check-In Prompt */}
      <CheckInPrompt />

      {/* Upcoming Milestone Reminders */}
      <div className="glass-panel rounded-2xl p-6" data-tutorial="milestone-reminders">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-cyan)]/80">
              Reminders
            </p>
            <h3 className="text-lg font-semibold text-white">Upcoming Milestones</h3>
            <p className="mt-1 text-sm text-white/60">
              A quick heads-up for anything due in the next 14 days.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <CalendarDays className="h-5 w-5 text-[var(--accent-cyan)]" />
          </div>
        </div>

        {upcomingMilestones.length > 0 ? (
          <div className="space-y-3">
            {upcomingMilestones.map((item) => {
              const isOverdue = item.daysUntil < 0;
              const isUrgent = item.daysUntil <= 2;
              const deadlineDate = parseISO(item.deadline);

              return (
                <button
                  key={item.milestoneId}
                  type="button"
                  onClick={() => onMissionSelect?.(item.goalId)}
                  className={`group flex w-full items-start justify-between gap-4 rounded-[18px] border px-4 py-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                    isOverdue
                      ? "border-rose-500/30 bg-rose-500/10 hover:border-rose-500/50 hover:bg-rose-500/15"
                      : isUrgent
                        ? "border-amber-400/30 bg-amber-400/10 hover:border-amber-400/50 hover:bg-amber-400/15"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                      {item.goalTitle}
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-white">
                      {item.milestoneTitle}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {isToday(deadlineDate)
                          ? "Today"
                          : isTomorrow(deadlineDate)
                            ? "Tomorrow"
                            : format(deadlineDate, "MMM d")}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        isOverdue
                          ? "bg-rose-400/15 text-rose-200"
                          : isUrgent
                            ? "bg-amber-400/15 text-amber-100"
                            : "bg-white/10 text-white/80"
                      }`}
                    >
                      {getDueLabel(item.daysUntil)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[18px] border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-white/60">
            No milestone deadlines are due soon. You’re in a good spot.
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => navigate("/timeline")}
            variant="secondary"
            className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            Open Timeline
          </Button>
        </div>
      </div>

      {/* Mission Progress - Expanded */}
      <div className="glass-panel rounded-2xl p-6" data-tutorial="mission-progress">
        <h3 className="font-semibold mb-4">Mission Progress</h3>
        <div className="space-y-4">
          <div data-tutorial="goals-progress">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">Goals Completed</span>
              <span className="text-[var(--accent-cyan)] font-medium">{Math.round(progressStats.goalsProgress)}%</span>
            </div>
            <Progress value={progressStats.goalsProgress} className="h-2 bg-white/10" />
          </div>

          <div data-tutorial="milestones-progress">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">Milestones Completed</span>
              <span className="text-[var(--accent-violet)] font-medium">{Math.round(progressStats.milestonesProgress)}%</span>
            </div>
            <Progress value={progressStats.milestonesProgress} className="h-2 bg-white/10" />
          </div>

          <div data-tutorial="tasks-progress">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">Tasks Completed</span>
              <span className="text-[var(--success)] font-medium">{Math.round(progressStats.tasksProgress)}%</span>
            </div>
            <Progress value={progressStats.tasksProgress} className="h-2 bg-white/10" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">Overall Progress</span>
              <span className="text-[var(--warning)] font-medium">{Math.round(progressStats.overallProgress)}%</span>
            </div>
            <Progress value={progressStats.overallProgress} className="h-2 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Mission Command Center - Promoted from below */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-lg font-semibold text-white mb-2">Mission Command Center</h3>
          <p className="text-sm text-white/60 mb-4">Ready to launch your next mission?</p>
          <Button
            onClick={onLaunchClick}
            className="arc-primary-gradient text-white font-semibold w-full border-0"
            data-tutorial="launch-button"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Launch New Mission
          </Button>
        </div>
      </div>

      {/* Daily Quote - Engraved style */}
      <DailyQuote />
    </motion.div>
  );
}
