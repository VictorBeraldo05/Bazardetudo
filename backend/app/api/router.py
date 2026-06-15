from fastapi import APIRouter

from app.api.routes import auth, categories, customers, dashboard, inventory, orders, products, reports, whatsapp


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["whatsapp"])

