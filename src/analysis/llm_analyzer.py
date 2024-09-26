import replicate
import json
from ..config import CONFIG
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMAnalyzer:
    def analyze_batch(self, tasks):
        try:
            system_prompt = "You are an AI assistant that analyzes task descriptions and provides detailed insights."
            user_prompt = "Analyze the following tasks:\n\n"
            
            for i, task in enumerate(tasks, 1):
                user_prompt += f"Task {i}:\nTitle: {task.title}\nDescription: {task.description}\n\n"
            
            user_prompt += """For each task, provide the following information:
1. Estimated complexity (1-10)
2. Potential risks (list at least 2-3 risks, separated by semicolons)
3. Required skills (list at least 2-3 skills, separated by semicolons)
4. Suggested priority (low/medium/high)

Respond in JSON format with task numbers as keys. Ensure all fields are filled for each task."""

            input_data = {
                "system_prompt": system_prompt,
                "prompt": user_prompt,
                "max_new_tokens": CONFIG['llm']['max_tokens'],
                "prompt_template": "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
            }

            output = replicate.run(
                CONFIG['llm']['model'],
                input=input_data
            )

            response_text = "".join(output)
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]

            analysis_results = json.loads(json_str)
            # Process the results
            for i, task in enumerate(tasks, 1):
                task_key_1 = str(i)
                task_key_2 = f"Task {i}"
                # Try both possible keys
                task_analysis = analysis_results.get(task_key_1, analysis_results.get(task_key_2, {}))
                
                if task_analysis:  # Only process if task_analysis is not empty
                    task.llm_analysis = {
                        "estimated_complexity": self._get_int_value(task_analysis, "estimated complexity", 5),
                        "potential_risks": self._parse_list(self._get_value(task_analysis, "potential risks")),
                        "required_skills": self._parse_list(self._get_value(task_analysis, "required skills")),
                        "suggested_priority": self._get_value(task_analysis, "suggested priority", "medium").lower()
                    }
                    print("Processed task analysis:", task.llm_analysis)
                else:
                    print(f"Warning: No analysis found for {task_key}")
                    task.llm_analysis = {
                        "estimated_complexity": 5,
                        "potential_risks": ["No data provided"],
                        "required_skills": ["No data provided"],
                        "suggested_priority": "medium"
                    }

            return tasks

        except Exception as e:
            print(f"Error analyzing tasks: {e}")
            return None

    @staticmethod
    def _parse_list(input_string):
        if not input_string:
            return ["No data provided"]
        return [item.strip() for item in input_string.split(';') if item.strip()]

    @staticmethod
    def _get_value(dictionary, key, default="No data provided"):
        """Case-insensitive key lookup."""
        for k, v in dictionary.items():
            if k.lower().replace(" ", "") == key.lower().replace(" ", ""):
                return v
        return default

    @staticmethod
    def _get_int_value(dictionary, key, default=5):
        """Case-insensitive key lookup for integer values."""
        value = LLMAnalyzer._get_value(dictionary, key, default)
        try:
            return int(value)
        except ValueError:
            return default