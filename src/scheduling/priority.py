class PriorityCalculator:
    def calculate(self, task, current_time, llm_analysis):
        time_elapsed = max(0, current_time - getattr(task, 'earliest_start', 0))
        decayed_reward = task.base_reward * (task.reward_decay_factor ** time_elapsed)
        
        complexity = llm_analysis.get('complexity', 5)
        priority_map = {'low': 1, 'medium': 2, 'high': 3}
        suggested_priority = priority_map.get(llm_analysis.get('suggested_priority', 'medium').lower(), 2)
        
        llm_factor = (complexity / 10) * suggested_priority
        
        return decayed_reward * llm_factor

    def calculate_reward(self, task, start_time):
        time_elapsed = max(0, start_time - getattr(task, 'earliest_start', 0))
        return task.base_reward * (task.reward_decay_factor ** time_elapsed)