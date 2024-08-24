from collections import deque
from ..models.task import Task
from .priority import PriorityCalculator
from ..analysis.llm_analyzer import LLMAnalyzer

class Scheduler:
    def __init__(self, tasks, resources):
        self.tasks = {task.id: task for task in tasks}
        self.resources = resources.copy()
        self.scheduled_tasks = []
        self.ready_tasks = deque()
        self.in_progress = {}
        self.completed_tasks = set()
        self.current_time = 0
        self.priority_calculator = PriorityCalculator()
        self.llm_analyzer = LLMAnalyzer()
        self.dependency_graph = self._build_dependency_graph()

    def _build_dependency_graph(self):
        graph = {task_id: set(task.dependencies) for task_id, task in self.tasks.items()}
        return graph

    def _detect_cycles(self):
        visited = set()
        recursion_stack = set()

        def dfs(node):
            visited.add(node)
            recursion_stack.add(node)

            for neighbor in self.dependency_graph[node]:
                if neighbor in recursion_stack:
                    return True
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True

            recursion_stack.remove(node)
            return False

        for node in self.dependency_graph:
            if node not in visited:
                if dfs(node):
                    return True
        return False

    def _break_dependency_cycle(self):
        # Simple strategy: remove the dependency with the lowest priority
        min_priority = float('inf')
        edge_to_remove = None

        for task_id, deps in self.dependency_graph.items():
            task_priority = self.priority_calculator.calculate(self.tasks[task_id], 0, self.tasks[task_id].llm_analysis)
            for dep in deps:
                dep_priority = self.priority_calculator.calculate(self.tasks[dep], 0, self.tasks[dep].llm_analysis)
                if dep_priority < min_priority:
                    min_priority = dep_priority
                    edge_to_remove = (task_id, dep)

        if edge_to_remove:
            self.dependency_graph[edge_to_remove[0]].remove(edge_to_remove[1])
            self.tasks[edge_to_remove[0]].dependencies.remove(edge_to_remove[1])
            print(f"Removed dependency: {edge_to_remove[1]} -> {edge_to_remove[0]}")

    def schedule(self):
        self._analyze_tasks()

        while self._detect_cycles():
            print("Dependency cycle detected. Attempting to resolve...")
            self._break_dependency_cycle()

        while len(self.completed_tasks) < len(self.tasks):
            self._update_completed_tasks()
            self._update_ready_tasks()
            self._calculate_priorities()
            self._assign_tasks()
            self._advance_time()

        return self.scheduled_tasks

    def _analyze_tasks(self):
        for task in self.tasks.values():
            task.llm_analysis = self.llm_analyzer.analyze(task)

    def _update_completed_tasks(self):
        completed = [task_id for task_id, end_time in self.in_progress.items() if end_time <= self.current_time]
        for task_id in completed:
            self.completed_tasks.add(task_id)
            del self.in_progress[task_id]
            task = self.tasks[task_id]
            self.resources.extend(task.required_resources)

    def _update_ready_tasks(self):
        for task in self.tasks.values():
            if task.id not in self.completed_tasks and task.id not in self.in_progress:
                if all(dep in self.completed_tasks for dep in task.dependencies):
                    if task not in self.ready_tasks:
                        self.ready_tasks.append(task)

    def _calculate_priorities(self):
        for task in self.ready_tasks:
            task.current_priority = self.priority_calculator.calculate(task, self.current_time, task.llm_analysis)

    def _assign_tasks(self):
        self.ready_tasks = deque(sorted(self.ready_tasks, key=lambda x: x.current_priority, reverse=True))
        while self.ready_tasks and self.resources:
            task = self.ready_tasks.popleft()
            if all(resource in self.resources for resource in task.required_resources):
                for resource in task.required_resources:
                    self.resources.remove(resource)
                task.start_time = self.current_time
                task.end_time = self.current_time + task.required_time
                self.in_progress[task.id] = task.end_time
                task.actual_reward = self.priority_calculator.calculate_reward(task, self.current_time)
                self.scheduled_tasks.append(task)

    def _advance_time(self):
        if self.in_progress:
            self.current_time = min(self.in_progress.values())
        else:
            self.current_time += 1