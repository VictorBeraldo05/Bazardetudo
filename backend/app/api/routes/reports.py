from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import admin_guard, db_session
from app.models.finance import FinancialTransaction
from app.models.fulfillment import Order


router = APIRouter(dependencies=[Depends(admin_guard)])


@router.get("/summary")
def report_summary(db: Session = Depends(db_session)) -> dict[str, str]:
    sales_total = db.scalar(select(func.coalesce(func.sum(Order.total_amount), Decimal("0")))) or Decimal("0")
    expense_total = (
        db.scalar(
            select(func.coalesce(func.sum(FinancialTransaction.amount), Decimal("0"))).where(
                FinancialTransaction.type == "expense"
            )
        )
        or Decimal("0")
    )
    return {"sales_total": str(sales_total), "expense_total": str(expense_total)}

