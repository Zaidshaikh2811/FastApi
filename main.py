
from fastapi import FastAPI, HTTPException, status
from models import Product , ProductUpdate
from typing import List

app = FastAPI()

products: List[Product] = [
    Product(id=1, name="Laptop Pro", description="A high-performance laptop for professionals.", price=1299.99, quantity=50),
    Product(id=2, name="Wireless Mouse", description="An ergonomic wireless mouse with long battery life.", price=49.99, quantity=200),
    Product(id=3, name="Mechanical Keyboard", description="A durable mechanical keyboard for typing enthusiasts.", price=119.99, quantity=120)
]

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items")
def read_items():
    return products




@app.patch("/items/{item_id}", response_model=Product)
def update_item(item_id: int, product_update: ProductUpdate):
    for i, p in enumerate(products):
        if p.id == item_id:
            # Convert the existing product to a dictionary
            stored_item_data = p.model_dump()
            # Convert the incoming update data to a dictionary, excluding any unset values
            update_data = product_update.model_dump(exclude_unset=True)
            # Merge the two dictionaries
            stored_item_data.update(update_data)
            # Create a new Product object from the merged data and replace the old one
            products[i] = Product(**stored_item_data)
            return products[i]
    raise HTTPException(status_code=404, detail="Item not found")


@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    """
    Delete a product by its ID.
    """
    for i, product in enumerate(products):
        if product.id == item_id:
            del products[i]
            return
    raise HTTPException(status_code=404, detail="Item not found")

 
