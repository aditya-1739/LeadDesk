from fastapi import FastAPI
from app.database.mongodb import db
from app.routes.leads import router as leads_router

app = FastAPI(title="LeadDesk API")
app.include_router(leads_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
