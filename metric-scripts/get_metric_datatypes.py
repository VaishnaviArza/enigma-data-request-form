from collections import defaultdict
import os
import json

with open(os.getcwd() + '/metrics_data.json', 'r') as f:
	categories = json.load(f)

types = set()
for category in categories:
	for metric in categories[category]:
		types.add(metric['variable_type'])
print(types)