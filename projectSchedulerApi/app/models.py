from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class Skill(BaseModel):
    titre: str
    niveau: int

class Collaborator(BaseModel):
    id: str                # ← change from int to str
    title: str
    role: str
    competences: List[Skill]

class ResourceMaster(BaseModel):
    id: str                # ← if you ever refer to resource IDs as strings
    nom: str
    type: str
    coutUnitaire: float
    qte: int

class ResourceRequest(BaseModel):
    name: str
    type: str
    category: str
    qte: int

class TaskInput(BaseModel):
    id: str                # ← change from int to str
    nomTache: str
    description: str
    budgetEstime: float
    dateDebut: str
    dateFinEstime: str
    duree: int
    ressourcesNecessaires: List[ResourceRequest]

class Dependency(BaseModel):
    type: str              # "FS", "SS", or "SUB"
    taskID1: str           # ← change from int to str
    taskID2: str           # ← change from int to str

class Projet(BaseModel):
    dateDebut: str
    dateFin: str

class ScheduleRequest(BaseModel):
    projet: Projet
    collaborateur: List[Collaborator]
    ressources: List[ResourceMaster]
    tasks: List[TaskInput]
    dependencies: List[Dependency]

    class Config:
        extra = "ignore"
class ResourceAllocation(BaseModel):
    id: str
    requested: int
    allocated: int

class TaskOutput(BaseModel):
    start: str
    end: str
    collaborator: Optional[str]
    resources: List[ResourceAllocation]

class ScheduleResponse(BaseModel):
    schedule: Dict[str, TaskOutput]