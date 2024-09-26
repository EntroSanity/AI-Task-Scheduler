import replicate
from typing import List
from ..models.task import Task
import json
from ..config import CONFIG
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMAnalyzer:
    def analyze_batch(self, tasks: List[Task]) -> List[Task]:
        try:
            logger.info(f"Analyzing {len(tasks)} tasks")
            system_prompt = (
                "You are an AI assistant that analyzes task descriptions and provides detailed insights. "
                "Your responses must be in valid JSON format, exactly matching the structure provided."
            )
            user_prompt = "Analyze the following tasks:\n\n"
            
            for i, task in enumerate(tasks, 1):
                user_prompt += f"Task {i}:\nTitle: {task.title}\nDescription: {task.description}\n\n"
            
            user_prompt += """For each task, provide the following information:
1. Estimated complexity (integer from 1 to 10)
2. Potential risks (list exactly 3 risks)
3. Required skills (list exactly 3 skills)
4. Suggested priority (string: "low", "medium", or "high")

Respond in JSON format using the following structure:
{
    "Task 1": {
        "estimatedComplexity": 5,
        "potentialRisks": ["Risk 1", "Risk 2", "Risk 3"],
        "requiredSkills": ["Skill 1", "Skill 2", "Skill 3"],
        "suggestedPriority": "medium"
    },
    "Task 2": {
        "estimatedComplexity": 7,
        "potentialRisks": ["Risk 1", "Risk 2", "Risk 3"],
        "requiredSkills": ["Skill 1", "Skill 2", "Skill 3"],
        "suggestedPriority": "high"
    }
}

Ensure all fields are filled for each task and maintain this exact JSON structure. Do not include any text before or after the JSON object."""

            input_data = {
                "system_prompt": system_prompt,
                "prompt": user_prompt,
                "max_new_tokens": CONFIG['llm']['max_tokens'],
                "temperature": 0.1,  # Lower temperature for more consistent output
                "prompt_template": "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
            }

            output = replicate.run(
                CONFIG['llm']['model'],
                input=input_data
            )
            response_text = "".join(output).strip()
            logger.info(f"Received analysis results for {len(tasks)} tasks")
            logger.info(f"Analysis results: {response_text}")
            
            try:
                analysis_results = json.loads(response_text)
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {e}")
                return None
            for i, task in enumerate(tasks, 1):
                task_key = f"Task {i}"
                task_analysis = analysis_results.get(task_key, {})
                
                if task_analysis:
                    task.llm_analysis = {
                        "estimated_complexity": task_analysis.get("estimatedComplexity", 5),
                        "potential_risks": task_analysis.get("potentialRisks", ["No data provided"]),
                        "required_skills": task_analysis.get("requiredSkills", ["No data provided"]),
                        "suggested_priority": task_analysis.get("suggestedPriority", "medium").lower()
                    }
                else:
                    logger.warning(f"No analysis found for {task_key}")
                    task.llm_analysis = {
                        "estimated_complexity": 5,
                        "potential_risks": ["No data provided"],
                        "required_skills": ["No data provided"],
                        "suggested_priority": "medium"
                    }

            return tasks

        except Exception as e:
            logger.error(f"Error analyzing tasks: {e}", exc_info=True)
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