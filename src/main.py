from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from src.core.config import settings
from src.api.dependencies import get_current_admin_user
from src.api.routes import users, laptops, admin, brands, stats, orders
from src.api import ws

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(laptops.router, prefix=f"{settings.API_V1_STR}/laptops", tags=["laptops"])
app.include_router(brands.router, prefix=f"{settings.API_V1_STR}/brands", tags=["brands"])
app.include_router(stats.router, prefix=f"{settings.API_V1_STR}/stats", tags=["stats"])
app.include_router(orders.router, prefix=f"{settings.API_V1_STR}/orders", tags=["orders"])
app.include_router(ws.router, prefix=settings.API_V1_STR, tags=["ws"])
app.include_router(
    admin.router,
    prefix=f"{settings.API_V1_STR}/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Serve frontend React app in production
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "build")
if os.path.exists(frontend_path):
    # Mount the /static directory for assets
    static_assets = os.path.join(frontend_path, "static")
    if os.path.exists(static_assets):
        app.mount("/static", StaticFiles(directory=static_assets), name="static")

    # Catch-all route to serve the React SPA
    @app.get("/{catchall:path}")
    async def serve_spa(catchall: str):
        # Serve manifest.json, favicon.ico, etc. directly from build root if they exist
        file_path = os.path.join(frontend_path, catchall)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise serve index.html for client-side routing
        return FileResponse(os.path.join(frontend_path, "index.html"))
