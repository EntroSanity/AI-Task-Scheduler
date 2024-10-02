import traceback
from collections import deque, defaultdict
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

    def _find_all_cycles(self):
        def dfs(node, path):
            if node in path:
                return [path[path.index(node):]]
            
            cycles = []
            path.append(node)
            for neighbor in self.dependency_graph[node]:
                if neighbor in self.dependency_graph:
                    cycles.extend(dfs(neighbor, path.copy()))
            return cycles

        all_cycles = []
        for node in self.dependency_graph:
            all_cycles.extend(dfs(node, []))
        return [list(dict.fromkeys(cycle)) for cycle in all_cycles]  # Remove duplicates

    def _break_dependency_cycle(self):
        cycles = self._find_all_cycles()
        if not cycles:
            print("No cycles found")
            return False

        edges_removed = 0
        for cycle in cycles:
            print(f"Found cycle: {' -> '.join(cycle)}")
            edge_to_remove = min(((cycle[i], cycle[(i+1) % len(cycle)]) for i in range(len(cycle))),
                                 key=lambda x: self.priority_calculator.calculate(self.tasks[x[0]], 0, self.tasks[x[0]].llm_analysis))
            
            if edge_to_remove[0] in self.dependency_graph and edge_to_remove[1] in self.dependency_graph[edge_to_remove[0]]:
                self.dependency_graph[edge_to_remove[0]].remove(edge_to_remove[1])
                if edge_to_remove[0] in self.tasks:
                    self.tasks[edge_to_remove[0]].dependencies.remove(edge_to_remove[1])
                print(f"Removed dependency: {edge_to_remove[1]} -> {edge_to_remove[0]}")
                edges_removed += 1

        return edges_removed > 0

    def _validate_dependencies(self):
        print("Validating dependencies...")
        for task_id, task in self.tasks.items():
            print(f"Task {task_id} dependencies: {task.dependencies}")
            for dep in list(task.dependencies):  # Use list() to avoid runtime modification issues
                if dep not in self.tasks:
                    print(f"Warning: Task {task_id} has invalid dependency {dep}")
                    task.dependencies.remove(dep)
        
        # Rebuild dependency graph after validation
        self.dependency_graph = self._build_dependency_graph()
        print("Dependency graph after validation:")
        for task_id, deps in self.dependency_graph.items():
            print(f"Task {task_id} depends on: {deps}")

    def _print_task_state(self):
        print("\nCurrent task state:")
        print("Completed tasks:", self.completed_tasks)
        print("In-progress tasks:", self.in_progress)
        print("Ready tasks:", [task.id for task in self.ready_tasks])
        print("Remaining tasks:", set(self.tasks.keys()) - self.completed_tasks - set(self.in_progress.keys()))

    def _print_full_task_state(self):
        print("\nFull task state:")
        for task_id, task in self.tasks.items():
            status = "Completed" if task_id in self.completed_tasks else \
                     "In Progress" if task_id in self.in_progress else \
                     "Ready" if task in self.ready_tasks else "Not Ready"
            print(f"Task {task_id}: {status}")
            print(f"  Dependencies: {task.dependencies}")
            print(f"  Required Resources: {task.required_resources}")
            print(f"  Base Reward: {task.base_reward}")
            print(f"  Required Time: {task.required_time}")

    def schedule(self):
        try:
            self._analyze_tasks()
            self._validate_dependencies()
            self._print_full_task_state()

            cycles_broken = 0
            while self._break_dependency_cycle():
                cycles_broken += 1
                print(f"Broke {cycles_broken} cycle(s)")

            max_iterations = len(self.tasks) * 2
            iteration = 0
            while len(self.completed_tasks) < len(self.tasks) and iteration < max_iterations:
                self._update_completed_tasks()
                self._update_ready_tasks()
                self._calculate_priorities()
                self._assign_tasks()
                self._advance_time()
                self._print_task_state()
                iteration += 1

            if iteration >= max_iterations:
                print("Warning: Reached maximum iterations. Scheduling might be incomplete.")

            return self.scheduled_tasks

        except Exception as e:
            print(f"Error in scheduling process: {str(e)}")
            print("Traceback:")
            print(traceback.format_exc())
            raise

    def _analyze_tasks(self):
        tasks = list(self.tasks.values())
        analyzed_tasks = self.llm_analyzer.analyze_batch(tasks)
        if analyzed_tasks:
            self.tasks = {task.id: task for task in analyzed_tasks}

    def _update_completed_tasks(self):
        completed = [task_id for task_id, end_time in self.in_progress.items() if end_time <= self.current_time]
        for task_id in completed:
            self.completed_tasks.add(task_id)
            del self.in_progress[task_id]
            task = self.tasks[task_id]
            self.resources.extend(task.required_resources)

    def _update_ready_tasks(self):
        print("\nUpdating ready tasks:")
        for task in self.tasks.values():
            if task.id not in self.completed_tasks and task.id not in self.in_progress:
                unmet_dependencies = [dep for dep in task.dependencies if dep not in self.completed_tasks]
                if not unmet_dependencies:
                    if task not in self.ready_tasks:
                        self.ready_tasks.append(task)
                        print(f"Task {task.id} is now ready")
                else:
                    print(f"Task {task.id} is not ready. Unmet dependencies: {unmet_dependencies}")

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
        print(f"Advanced time to {self.current_time}")