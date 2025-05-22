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
        date_fmt = "%Y-%m-%dT%H:%M"
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
            self.collab_embeddings[collab['id']] = self.model_st.encode(skills, convert_to_tensor=True)

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

        makespan = self.model.NewIntVar(0, self.horizon, 'makespan')
        self.model.AddMaxEquality(makespan, [v['end'] for v in self.task_vars.values()])

        # Combine makespan minimization and allocation maximization
        total_alloc = sum(self.allocated_vars.values())
        total_assign = sum(self.assignment_vars.values())

        bigM = sum(self.requested_qte.values()) + 1
        # lexicographic: minimize makespan first, then maximize allocations
        self.model.Minimize(- (total_alloc + total_assign * 100) * bigM + makespan)

    def _add_resource_constraints(self):
        # Initialize allocated_vars for Energetic & Temporary resources
        self.allocated_vars = {}
        self._material_unit_intervals = {}

        # 1) Material resources: decompose into per-unit optional intervals
        for res in self.resources.values():
            if res['type'] == 'Material':
                # collect all unit-intervals across tasks
                all_ivars = []
                all_units = []
                for task in self.tasks:
                    for req in task['mapped_resources']:
                        if req['id'] == res['id']:
                            tid = task['id']
                            start_var, end_var, _ = self.intervals[tid]
                            q = req['qte']
                            # create integer allocated var
                            alloc_var = self.model.NewIntVar(0, q, f'alloc_{tid}_{res["id"]}')
                            self.allocated_vars[(tid, res['id'])] = alloc_var
                            # unit bool vars & optional intervals
                            unit_vars = []
                            for i in range(q):
                                b = self.model.NewBoolVar(f'unit_{tid}_{res["id"]}_{i}')
                                iv = self.model.NewOptionalIntervalVar(
                                    start_var, task['duration'], end_var,
                                    b, f'iv_{tid}_{res["id"]}_{i}')
                                unit_vars.append(b)
                                all_ivars.append(iv)
                                all_units.append(b)
                            # link sum(unit_vars) == alloc_var
                            self.model.Add(alloc_var == sum(unit_vars))
                # enforce cumulative capacity across all unit intervals
                if all_ivars:
                    self.model.AddCumulative(all_ivars, [1]*len(all_ivars), res['qte'])


        # 2) Energetic/Temporary: variable allocations with capacity constraint
        for res in self.resources.values():
            if res['type'] in ['Energetic', 'Temporary']:
                alloc_vars = []
                for task in self.tasks:
                    for req in task['mapped_resources']:
                        if req['id'] == res['id']:
                            key = (task['id'], res['id'])
                            self.requested_qte[key] = req['qte']
                            var = self.model.NewIntVar(0, req['qte'],
                                                       f'alloc_{task["id"]}_{res["id"]}')
                            self.allocated_vars[key] = var
                            alloc_vars.append(var)
                if alloc_vars:
                    self.model.Add(sum(alloc_vars) <= res['qte'])


       
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
    with open('message.json') as f:
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