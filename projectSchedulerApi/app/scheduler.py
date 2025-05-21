import json
from datetime import datetime, timedelta
from ortools.sat.python import cp_model
from sentence_transformers import SentenceTransformer, util
import numpy as np

# Configuration
TIME_UNIT = 3600  # 1 hour in seconds
MODEL_NAME = 'all-MiniLM-L6-v2'

class ProjectScheduler:
    def __init__(self, input_data):
        self.input = input_data
        self.tasks = input_data['tasks']
        self.resources = {r['id']: r for r in input_data['ressources']}
        self.collaborators = input_data['collaborateur']
        self.dependencies = input_data['dependencies']

        self.requested_qte = {}       # store original requested quantities
        self._preprocess_dates()
        self._map_resources()
        self._prepare_collaborator_matching()

        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        self.intervals = {}
        self.task_vars = {}
        self.assignment_vars = {}

        total_seconds = (self.project_end - self.project_start).total_seconds()
        self.horizon = int(total_seconds // TIME_UNIT) + 1

    def _preprocess_dates(self):
        date_fmt = "%Y-%m-%dT%H:%M:%S.%fZ"
        self.project_start = datetime.strptime(self.input['projet']['dateDebut'], date_fmt)
        self.project_end = datetime.strptime(self.input['projet']['dateFin'], date_fmt)

        for task in self.tasks:
            task['start_orig'] = datetime.strptime(task['dateDebut'], date_fmt)
            task['end_orig'] = datetime.strptime(task['dateFinEstime'], date_fmt)
            task['duration'] = task['duree'] // TIME_UNIT

    def _map_resources(self):
        for task in self.tasks:
            task['mapped_resources'] = []
            for req in task['ressourcesNecessaires']:
                matched = next((r for r in self.input['ressources']
                             if r['nom'] == req['name'] and r['type'] == req['type']), None)
                if not matched:
                    raise ValueError(f"Resource {req['name']} ({req['type']}) not found")
                task['mapped_resources'].append({
                    'id': matched['id'],
                    'qte': req['qte'],
                    'type': matched['type']
                })

    def _prepare_collaborator_matching(self):
        self.model_st = SentenceTransformer(MODEL_NAME)
        self.task_texts = {}
        self.task_embeddings = {}
        for task in self.tasks:
            text = f"{task['nomTache']}: {task['description']}"
            self.task_texts[task['id']] = text
            self.task_embeddings[task['id']] = self.model_st.encode(text, convert_to_tensor=True)

        self.collab_embeddings = {}
        for collab in self.collaborators:
            skills = ', '.join([f"{c['titre']} (Level {c['niveau']})" for c in collab['competences']])
            text = f"{collab['title']} ({collab['role']}). Skills: {skills}"
            self.collab_embeddings[collab['id']] = self.model_st.encode(text, convert_to_tensor=True)

    def _get_collab_scores(self, task_id):
        task_embed = self.task_embeddings[task_id]
        task_text = self.task_texts[task_id].lower()
        scores = []
        for collab in self.collaborators:
            similarity = util.pytorch_cos_sim(task_embed, self.collab_embeddings[collab['id']]).item()
            task_skills = [word for word in task_text.split() if len(word) > 3]
            collab_skills = [skill['titre'].lower() for skill in collab['competences']]
            exact_matches = len(set(task_skills) & set(collab_skills))
            role_match = 0.3 if collab['role'].lower() in task_text else 0
            total_score = similarity + (exact_matches * 0.2) + role_match
            scores.append((collab['id'], total_score))
        return sorted(scores, key=lambda x: x[1], reverse=True)

    def build_model(self):
        # Create task intervals
        for task in self.tasks:
            tid = task['id']
            start = self.model.NewIntVar(0, self.horizon, f'start_{tid}')
            end = self.model.NewIntVar(0, self.horizon, f'end_{tid}')
            interval = self.model.NewIntervalVar(start, task['duration'], end, f'interval_{tid}')
            self.intervals[tid] = (start, end, interval)
            self.task_vars[tid] = {'start': start, 'end': end}

        # Dependencies
        for dep in self.dependencies:
            t1, t2 = dep['taskID1'], dep['taskID2']
            if dep['type'] == 'FS':
                self.model.Add(self.task_vars[t2]['start'] >= self.task_vars[t1]['end'])
            elif dep['type'] == 'SS':
                self.model.Add(self.task_vars[t2]['start'] == self.task_vars[t1]['start'])
            elif dep['type'] == 'SUB':
                self.model.Add(self.task_vars[t2]['start'] >= self.task_vars[t1]['start'])
                self.model.Add(self.task_vars[t2]['end'] <= self.task_vars[t1]['end'])

        self._add_resource_constraints()
        self._add_collaborator_constraints()

        # Makespan objective
        makespan = self.model.NewIntVar(0, self.horizon, 'makespan')
        self.model.AddMaxEquality(makespan, [v['end'] for v in self.task_vars.values()])
        self.model.Minimize(makespan)
        
        # Secondary: maximize total allocations
        if self.allocated_vars:
            self.model.Maximize(sum(self.allocated_vars.values()))

            
        self.model.Maximize(sum(self.assignment_vars.values()))


    def _add_resource_constraints(self):
        # Material resources (cumulative)
        for res in self.resources.values():
            if res['type'] == 'Material':
                intervals, demands = [], []
                for task in self.tasks:
                    for req in task['mapped_resources']:
                        if req['id'] == res['id']:
                            intervals.append(self.intervals[task['id']][2])
                            demands.append(req['qte'])
                if intervals:
                    self.model.AddCumulative(intervals, demands, res['qte'])

        # Energetic/Temporary: track and store requested qte
        self.allocated_vars = {}
        for res in self.resources.values():
            if res['type'] in ['Energetic', 'Temporary']:
                allocs = []
                for task in self.tasks:
                    for req in task['mapped_resources']:
                        if req['id'] == res['id']:
                            key = (task['id'], res['id'])
                            self.requested_qte[key] = req['qte']
                            var = self.model.NewIntVar(0, req['qte'], f'alloc_{task["id"]}_{res["id"]}')
                            self.allocated_vars[key] = var
                            allocs.append(var)
                if allocs:
                    self.model.Add(sum(allocs) <= res['qte'])

    def _add_collaborator_constraints(self):
        self.collab_assignments = {c['id']: [] for c in self.collaborators}
        for task in self.tasks:
            tid = task['id']
            scores = self._get_collab_scores(tid)
            
            eligible = [cid for cid, sc in scores if sc > 0.25][:3]

            assign_vars = []
            for cid in eligible:
                var = self.model.NewBoolVar(f'assign_{tid}_{cid}')
                self.assignment_vars[(tid, cid)] = var
                iv = self.model.NewOptionalIntervalVar(
                    self.task_vars[tid]['start'], task['duration'],
                    self.task_vars[tid]['end'], var, f'interval_{tid}_{cid}')
                self.collab_assignments[cid].append(iv)
                assign_vars.append(var)
            if assign_vars:
                self.model.Add(sum(assign_vars) <= 1)
        # One task at a time per collaborator
        for cid, ivs in self.collab_assignments.items():
            if ivs:
                self.model.AddCumulative(ivs, [1]*len(ivs), 1)

    def solve(self):
        status = self.solver.Solve(self.model)
        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            self._collect_results()
            return True
        return False

    def _collect_results(self):
        # Build JSON-friendly dict
        self.schedule = {}
        for task in self.tasks:
            tid = task['id']
            start = (self.project_start + timedelta(hours=self.solver.Value(self.task_vars[tid]['start'])))
            end   = (self.project_start + timedelta(hours=self.solver.Value(self.task_vars[tid]['end'])))
            collab = next((cid for (t, cid), v in self.assignment_vars.items()
                           if t == tid and self.solver.Value(v) == 1), None)
            res_list = []
            for req in task['mapped_resources']:
                key = (tid, req['id'])
                alloc = self.solver.Value(self.allocated_vars[key]) if key in self.allocated_vars else req['qte']
                requested = self.requested_qte.get(key, req['qte'])
                res_list.append({'id': req['id'], 'requested': requested, 'allocated': alloc})
            self.schedule[tid] = {
                'start': start.isoformat(),
                'end': end.isoformat(),
                'collaborator': collab,
                'resources': res_list
            }

    def get_schedule_json(self):
        """
        Returns the computed schedule as a JSON string.
        """
        return json.dumps({'schedule': self.schedule}, indent=2)

if __name__ == "__main__":
    with open('test.json') as f:
        data = json.load(f)
    sched = ProjectScheduler(data)
    sched.build_model()

    # solver parameters
    sched.solver.parameters.num_search_workers = 8
    sched.solver.parameters.max_time_in_seconds = 30

    status = sched.solver.Solve(sched.model)
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        sched._collect_results()
        print(sched.get_schedule_json())
    else:
        print(f"No feasible schedule found (status={sched.solver.StatusName(status)})")