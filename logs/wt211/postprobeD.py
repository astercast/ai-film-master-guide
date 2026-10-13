import importlib.util, json
spec = importlib.util.spec_from_file_location("probe", "logs/wt211/probe.py")
pr = importlib.util.module_from_spec(spec); spec.loader.exec_module(pr)
out = open("logs/wt211/postD-probes.jsonl", "w")
for u in open("logs/wt211/runD-failed-urls.txt").read().split():
    r = pr.probe(u)
    out.write(json.dumps({k: v for k, v in r.items() if k != "text"}) + "\n"); out.flush()
out.close()
