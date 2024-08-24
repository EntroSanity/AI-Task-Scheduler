import toml
import os

def load_config():
    config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config.toml')
    with open(config_path, 'r') as f:
        return toml.load(f)

CONFIG = load_config()