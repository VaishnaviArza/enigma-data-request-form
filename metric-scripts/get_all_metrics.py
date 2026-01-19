from collections import defaultdict, OrderedDict
import os
import json

working_dir = os.getcwd().split('/faculty')[0]
project_root = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(project_root, "../static/anonymized_data")
#os.makedirs(static_dir, exist_ok=True)
metrics_dir = f'{working_dir}/faculty/sliew/enigma/new/infodb/metrics'
metric_paths = [os.path.join(metrics_dir, file)
                for file in os.listdir(metrics_dir)
                if os.path.isfile(os.path.join(metrics_dir, file)) and not file.startswith('.')]

categories = defaultdict(lambda: defaultdict(list))
#for path in metric_paths:
#	with open(path, 'r') as f:
#		metric = json.load(f)
#		categories[str(metric['category']).strip()].append({"metric_name": str(metric['metric_name']).strip(),
 #                                        "variable_type": str(metric['variable_type']).strip(),
  #                                       "description": str(metric['description']).strip()
	#				 })

for path in metric_paths:
   try:
        if os.path.getsize(path) == 0:
            continue

        with open(path, 'r') as f:
            metric = json.load(f)
        #print("Loaded metric:", metric)

        #if metric['show']:
        for key, metric in metric.items():
            if metric['show']:
                category = str(metric['category']).strip()
                subcategory = str(metric.get('subcategory', '')).strip()
                metric_info = {
                "metric_name": str(metric['metric_name']).strip(),
                "name": str(metric.get('name', metric['metric_name'])).strip(),
                "variable_type": str(metric['variable_type']).strip(),
                "description": str(metric['description']).strip(),
                "show_order": metric.get('show_order'),
                "essential": bool(metric.get("essential", False)),
                "space": metric.get("space"),
                }
                categories[category][subcategory].append(metric_info)

   except (IsADirectoryError, json.JSONDecodeError):
        continue
for category in categories:
    for subcaregory in categories[category]:
        categories[category][subcaregory] = sorted(
            categories[category][subcaregory], key=lambda x: (x['show_order'] is None, 
            x['show_order'] if x['show_order'] is not None else x['name'].lower()))
	

for category in categories:
    categories[category] = OrderedDict(
        sorted(categories[category].items(), key=lambda x: (x[0] == '', x[0]))
    )
categories = dict(sorted(categories.items()))

#with open(os.getcwd() + '/metrics_data.json', 'w') as outfile:
 #   json.dump(categories, outfile, indent=4)
metrics_path = os.path.join(static_dir, "metrics_data.json")
with open(metrics_path, "w") as outfile:
    json.dump(categories, outfile, indent=4)