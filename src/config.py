import toml
import os

class Config:
    def __init__(self):
        config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config.toml')
        with open(config_path, 'r') as f:
            self._config = toml.load(f)

    def get(self, key, default=None):
        return self._config.get(key, default)

    def __getitem__(self, key):
        return self._config[key]

    def __contains__(self, key):
        return key in self._config

    @property
    def server_host(self):
        return self._config['server']['host']

    @property
    def server_port(self):
        return int(self._config['server']['port'])

    @property
    def server_debug(self):
        return bool(self._config['server']['debug'])

# Create a global instance of the Config class
CONFIG = Config()