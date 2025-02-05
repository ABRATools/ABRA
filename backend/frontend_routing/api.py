from fastapi import APIRouter

router = APIRouter(prefix="/api")


# these routes are just placeholder / examples

@router.get("/systems")
async def get_systems():
    # return system data
    pass

@router.get("/systems/{system_id}")
async def get_system(system_id: str):
    # return specific system data
    pass