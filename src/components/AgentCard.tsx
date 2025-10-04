import React from 'react';
import type { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agentId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isSelected,
  onSelect,
}) => {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    cyan: 'from-cyan-500 to-cyan-600',
  };

  const gradientClass = colorMap[agent.color] || colorMap.blue;

  return (
    <div
      onClick={() => onSelect(agent.id)}
      className={`
        relative overflow-hidden rounded-xl p-6 cursor-pointer
        transition-all duration-300 transform hover:scale-105
        ${
          isSelected
            ? 'ring-4 ring-primary-500 shadow-2xl'
            : 'shadow-lg hover:shadow-xl'
        }
        bg-white dark:bg-gray-800
      `}
    >
      <div
        className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${gradientClass}`}
      />

      <div className="flex items-start gap-4">
        <div
          className={`
          flex-shrink-0 w-14 h-14 rounded-lg
          bg-gradient-to-br ${gradientClass}
          flex items-center justify-center
          text-white text-2xl font-bold
          shadow-md
        `}
        >
          {agent.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {agent.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {agent.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`
          inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
          ${
            isSelected
              ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }
        `}
        >
          {agent.category.toUpperCase()}
        </span>

        {isSelected && (
          <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
            Active ✓
          </span>
        )}
      </div>
    </div>
  );
};
