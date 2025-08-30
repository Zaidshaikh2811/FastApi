
from pydantic import BaseModel
from typing import Optional


class Product(BaseModel):
    id:int
    name:str
    description:str
    price:float
    quantity:int

    
 

 
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
