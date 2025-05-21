from fastapi import FastAPI, HTTPException
from .models import ScheduleRequest, ScheduleResponse
from .scheduler import ProjectScheduler

app = FastAPI(title="Project Scheduler API")

@app.post("/schedule", response_model=ScheduleResponse)
async def create_schedule(request: ScheduleRequest):
    try:
        # instantiate and solve
        sched = ProjectScheduler(request.dict())
        sched.build_model()
        sched.solver.parameters.num_search_workers = 8
        sched.solver.parameters.max_time_in_seconds = 30
        if not sched.solve():
            # still return partial schedule even if sub‑optimal?
            # up to you—here we proceed with whatever was found
            pass
        return ScheduleResponse(schedule=sched.schedule)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # catch‑all; avoid leaking internals
        raise HTTPException(status_code=500,
                            detail="Internal scheduling error")
