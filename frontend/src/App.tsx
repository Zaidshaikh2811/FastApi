
import { useState, useEffect, useCallback } from 'react';
import './App.css'
// Configuration for the API base URL. In a real Vite project,
// you might put this in a .env file.
const API_BASE_URL = "http://127.0.0.1:8000";

// --- Reusable UI Components ---

type NotificationProps = {
  message: string;
  type: 'success' | 'error' | '';
  onClear: () => void;
};
function Notification({ message, type, onClear }: NotificationProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClear();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);
  if (!message) return null;
  const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white font-semibold z-50 transition-opacity duration-300";
  const typeClasses = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {message}
    </div>
  );
}

type ConfirmModalProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};
function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
        <p className="text-lg text-gray-800 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors">Confirm</button>
        </div>
      </div>
    </div>
  );
}



type Product = {
  id: number | string;
  name: string;
  description: string;
  price: number;
  quantity: number;
};

type Filters = {
  name: string;
  min_price: string;
  max_price: string;
};

type Pagination = {
  skip: number;
  limit: number;
};

type NotificationState = {
  message: string;
  type: 'success' | 'error' | '';
};

const DEFAULT_LIMIT = 8;

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ name: '', min_price: '', max_price: '' });
  const [pagination, setPagination] = useState<Pagination>({ skip: 0, limit: DEFAULT_LIMIT });
  const [isCreateModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<NotificationState>({ message: '', type: '' });
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const queryObj: Record<string, string> = {
      skip: String(pagination.skip),
      limit: String(pagination.limit),
    };
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') queryObj[key] = value;
    });
    const query = new URLSearchParams(queryObj);
    try {
      const response = await fetch(`${API_BASE_URL}/items?${query.toString()}`);
      if (!response.ok) throw new Error(`API Error: ${response.statusText} (${response.status})`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, skip: 0 }));
  };

  const handleNextPage = () => {
    if (products.length === pagination.limit) {
      setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }));
    }
  };
  const handlePrevPage = () => {
    setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }));
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const handleCreate = async (productData: Omit<Product, 'id'> | Product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.detail || 'Failed to create product.');
      setCreateModalOpen(false);
      showNotification('Product created successfully!');
      fetchProducts();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  const handleUpdate = async (productData: Partial<Product>) => {
    if (!editingProduct) return;
    try {
      const response = await fetch(`${API_BASE_URL}/items/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to update product.');
      setEditingProduct(null);
      showNotification('Product updated successfully!');
      fetchProducts();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  const handleDeleteRequest = (productId: number | string) => {
    setConfirmAction(() => () => {
      (async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/items/${productId}`, {
            method: 'DELETE',
          });
          if (!response.ok) throw new Error('Failed to delete product.');
          showNotification('Product deleted successfully!');
          fetchProducts();
        } catch (err) {
          showNotification(err instanceof Error ? err.message : String(err), 'error');
        } finally {
          setConfirmAction(null);
        }
      })();
    });
  };


  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        onClear={() => setNotification({ message: '', type: '' })}
      />
      {confirmAction && (
        <ConfirmModal
          message="Are you sure you want to delete this product?"
          onConfirm={confirmAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-['Inter',_sans-serif]">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Product Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your inventory with ease.</p>
          </header>

          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <form onSubmit={handleFilterSubmit} className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="Product Name" className="p-2 border rounded-md" />
                <input type="number" name="min_price" value={filters.min_price} onChange={handleFilterChange} placeholder="Min Price" className="p-2 border rounded-md" />
                <input type="number" name="max_price" value={filters.max_price} onChange={handleFilterChange} placeholder="Max Price" className="p-2 border rounded-md" />
                <button type="submit" className="sm:col-span-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors p-2 rounded-md font-semibold">Apply Filters</button>
              </form>
              <button onClick={() => setCreateModalOpen(true)} className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 transition-colors p-2 rounded-md font-semibold mt-4 md:mt-0">
                + Add New Product
              </button>
            </div>
          </div>

          {loading && <div className="text-center p-8">Loading products...</div>}
          {error && <div className="text-center p-8 text-red-600 bg-red-100 rounded-lg">{error}</div>}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} onEdit={setEditingProduct} onDelete={handleDeleteRequest} />
                ))}
              </div>
              {products.length === 0 && <div className="text-center p-8 text-gray-500">No products found. Try adjusting your filters.</div>}

              <div className="flex justify-between items-center mt-8">
                <button onClick={handlePrevPage} disabled={pagination.skip === 0} className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="text-gray-700">Page {Math.floor(pagination.skip / pagination.limit) + 1}</span>
                <button onClick={handleNextPage} disabled={products.length < pagination.limit} className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {isCreateModalOpen && (
          <ProductModal
            title="Add New Product"
            product={null}
            onClose={() => setCreateModalOpen(false)}
            onSave={handleCreate}
          />
        )}
        {editingProduct && (
          <ProductModal
            title="Edit Product"
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSave={handleUpdate}
          />
        )}
      </div>
    </>
  );
}

type ProductCardProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number | string) => void;
};
function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-between transition-transform hover:scale-105">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 truncate">{product.name}</h3>
        <p className="text-gray-600 mt-2 h-20 overflow-hidden text-ellipsis">{product.description}</p>
      </div>
      <div className="bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
          <p className="text-gray-700 bg-gray-200 px-3 py-1 rounded-full text-sm font-medium">Qty: {product.quantity}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(product)} className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors py-2 rounded-md font-semibold">Edit</button>
          <button onClick={() => onDelete(product.id)} className="w-full bg-red-600 text-white hover:bg-red-700 transition-colors py-2 rounded-md font-semibold">Delete</button>
        </div>
      </div>
    </div>
  );
}

type ProductModalProps = {
  title: string;
  product: Product | null;
  onClose: () => void;
  onSave: (data: Product | Partial<Product>) => void;
};
function ProductModal({ title, product, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState<{
    id: number | string;
    name: string;
    description: string;
    price: number | '';
    quantity: number | '';
  }>({
    id: product?.id ?? '',
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    quantity: product?.quantity ?? '',
  });

  const isEditMode = !!product;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditMode && product) {
      const updatedData = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => key !== 'id' && value !== (product as Product)[key as keyof Product] && value !== '')
      );
      // Always include id for edit
      onSave({ ...updatedData, id: formData.id } as Partial<Product>);
    } else {
      // For create, ensure all fields are present and id is defined
      if (formData.id === '' || formData.name === '' || formData.description === '' || formData.price === '' || formData.quantity === '') {
        return;
      }
      onSave(formData as Product);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40" onClick={onClose}>
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isEditMode && <input type="number" name="id" value={formData.id} onChange={handleChange} placeholder="Product ID" className="w-full p-2 border rounded-md" required />}
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" className="w-full p-2 border rounded-md" required={!isEditMode} />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded-md" rows={3} required={!isEditMode}></textarea>
            <input type="number" name="price" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full p-2 border rounded-md" required={!isEditMode} />
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" className="w-full p-2 border rounded-md" required={!isEditMode} />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors px-4 py-2 rounded-md font-semibold">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 transition-colors px-4 py-2 rounded-md font-semibold">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
