
from fastapi import FastAPI, HTTPException, status
from models import Product , ProductUpdate
from typing import List , Optional
from fastapi.middleware.cors import CORSMiddleware # 1. Import the middleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173", # Default for Vite
    "http://localhost:3000", # Default for Create React App
    "null", # Allows requests from local files (opening index.html directly)
]

# 3. Add the middleware to your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)



products: List[Product] = [
    Product(id=1, name="Laptop Pro", description="A high-performance laptop for professionals.", price=1299.99, quantity=50),
    Product(id=2, name="Wireless Mouse", description="An ergonomic wireless mouse with long battery life.", price=49.99, quantity=200),
    Product(id=3, name="Mechanical Keyboard", description="A durable mechanical keyboard for typing enthusiasts.", price=119.99, quantity=120),
    Product(id=4, name="4K Monitor", description="A 27-inch 4K UHD monitor with vibrant colors.", price=399.99, quantity=80),
    Product(id=5, name="Webcam HD", description="A 1080p HD webcam for clear video calls.", price=89.99, quantity=150),
    Product(id=6, name="USB-C Hub", description="A multi-port USB-C hub for expanded connectivity.", price=59.99, quantity=250),
    Product(id=7, name="External SSD", description="A 1TB external solid-state drive for fast storage.", price=129.99, quantity=100),
    Product(id=8, name="Noise-Cancelling Headphones", description="Over-ear headphones with active noise cancellation.", price=249.99, quantity=70),
    Product(id=9, name="Gaming Laptop", description="A powerful laptop designed for gaming.", price=1899.99, quantity=30),
    Product(id=10, name="Smartwatch", description="A feature-rich smartwatch with fitness tracking.", price=349.99, quantity=90)
]

@app.get("/")
def read_root():
    return {"Hello": "World"}


 

@app.post("/items", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_item(product: Product):
 
    if any(p.id == product.id for p in products):
        raise HTTPException(status_code=400, detail=f"Product with ID {product.id} already exists.")
    products.append(product)
    return product

@app.get("/items", response_model=List[Product])
def read_items(
    name: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = 0,
    limit: int = 10
):
 
    results = products
    if name:
        results = [p for p in results if name.lower() in p.name.lower()]
    if min_price is not None:
        results = [p for p in results if p.price >= min_price]
    if max_price is not None:
        results = [p for p in results if p.price <= max_price]

 
    return results[skip : skip + limit]

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

 
