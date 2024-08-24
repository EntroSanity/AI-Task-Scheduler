class Task:
    def __init__(self, id, title, description=None, requiredTime=None, dependencies=None, requiredResources=None, baseReward=None, rewardDecayFactor=None):
        self.id = id
        self.title = title
        self.description = description
        self.required_time = requiredTime
        self.dependencies = dependencies or []
        self.required_resources = requiredResources or []
        self.base_reward = baseReward
        self.reward_decay_factor = rewardDecayFactor
        self.llm_analysis = None
        self.current_priority = 0
        self.start_time = None
        self.end_time = None
        self.actual_reward = 0

    @classmethod
    def from_input_dict(cls, data):
        return cls(
            id=data['id'],
            title=data['title'],
            description=data['description'],
            requiredTime=data['requiredTime'],
            dependencies=data['dependencies'],
            requiredResources=data['requiredResources'],
            baseReward=data['baseReward'],
            rewardDecayFactor=data['rewardDecayFactor']
        )

    @classmethod
    def from_output_dict(cls, data):
        task = cls(
            id=data['id'],
            title=data['title']
        )
        task.start_time = data['start_time']
        task.end_time = data['end_time']
        task.required_resources = data['resources']
        task.actual_reward = data['actual_reward']
        task.llm_analysis = data['llm_analysis']
        return task

    def to_output_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'resources': self.required_resources,
            'actual_reward': self.actual_reward,
            'llm_analysis': self.llm_analysis
        }