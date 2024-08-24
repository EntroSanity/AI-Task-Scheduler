import replicate
import json
from ..config import CONFIG

class LLMAnalyzer:
    def analyze(self, task):
        try:
            system_prompt = "You are an AI assistant that analyzes task descriptions and provides insights."
            user_prompt = f"Analyze this task:\nTitle: {task.title}\nDescription: {task.description}\n\nProvide estimated complexity (1-10), potential risks, required skills, and suggested priority (low/medium/high). Respond in JSON format."

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

            return json.loads(json_str)
        except Exception as e:
            print(f"Error analyzing task: {e}")
            return None