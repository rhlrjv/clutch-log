from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4


@dataclass
class Motorcycle:
    id: UUID
    name: str
    make: str
    model: str
    year: int
    current_mileage: int
    vin: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    insurance_expiry: Optional[datetime] = None
    purchase_date: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    @classmethod
    def create(
        cls,
        name: str,
        make: str,
        model: str,
        year: int,
        current_mileage: int,
        vin: Optional[str] = None,
        insurance_provider: Optional[str] = None,
        insurance_policy_number: Optional[str] = None,
        insurance_expiry: Optional[datetime] = None,
        purchase_date: Optional[datetime] = None,
    ) -> "Motorcycle":
        return cls(
            id=uuid4(),
            name=name,
            make=make,
            model=model,
            year=year,
            current_mileage=current_mileage,
            vin=vin,
            insurance_provider=insurance_provider,
            insurance_policy_number=insurance_policy_number,
            insurance_expiry=insurance_expiry,
            purchase_date=purchase_date,
        )

    def update_mileage(self, new_mileage: int) -> None:
        if new_mileage < self.current_mileage:
            raise ValueError("New mileage cannot be less than current mileage")
        self.current_mileage = new_mileage
        self.updated_at = datetime.utcnow()