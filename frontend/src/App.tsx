import './App.css'

import { useState, useEffect, useCallback } from 'react';

// --- Configuration ---
// In a real project, you might put this in a .env file.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log(API_BASE_URL);

const DEFAULT_LIMIT = 8;

// --- SVG Icon Components ---
// Using inline SVGs to keep everything in one file and avoid external dependencies.

const PlusIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ExclamationCircleIcon = () => (
  <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

// --- Type Definitions ---
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


// --- Reusable UI Components ---

type NotificationProps = {
  message: string;
  type: 'success' | 'error' | '';
  onClear: () => void;
};
function Notification({ message, type, onClear }: NotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Allow time for fade-out animation before clearing the message
        setTimeout(onClear, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message) return null;

  const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-2xl text-white font-semibold z-50 flex items-center transition-all duration-300 ease-in-out";
  const typeClasses = type === 'error' ? 'bg-red-600' : 'bg-green-600';
  const visibilityClasses = visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10';

  return (
    <div className={`${baseClasses} ${typeClasses} ${visibilityClasses}`}>
      {type === 'success' ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full transform transition-all animate-scale-in">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Confirm Action</h3>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">Confirm</button>
        </div>
      </div>
    </div>
  );
}


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
      // Simulate network delay for loading state
      await new Promise(resolve => setTimeout(resolve, 500));
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
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={confirmAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-['Inter',_sans-serif] text-slate-800">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Product Dashboard</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage your inventory with ease and efficiency.</p>
          </header>

          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <form onSubmit={handleFilterSubmit} className="flex-grow w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="Product Name..." className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                  <input type="number" name="min_price" value={filters.min_price} onChange={handleFilterChange} placeholder="Min Price" className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                  <input type="number" name="max_price" value={filters.max_price} onChange={handleFilterChange} placeholder="Max Price" className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                  <button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors p-3 rounded-lg font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Apply Filters</button>
                </div>
              </form>
              <button onClick={() => setCreateModalOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors p-3 rounded-lg font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <PlusIcon />
                Add Product
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center p-16">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-slate-500">Fetching products...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-700 bg-red-100 rounded-lg shadow">
              <h3 className="font-bold text-lg">An Error Occurred</h3>
              <p>{error}</p>
            </div>
          ) : (
            <>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} onEdit={setEditingProduct} onDelete={handleDeleteRequest} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-slate-800">No Products Found</h3>
                  <p className="text-slate-500 mt-2">Try adjusting your filters or add a new product to get started.</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-10">
                <button onClick={handlePrevPage} disabled={pagination.skip === 0} className="flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-200 transition-colors px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-slate-200">
                  <ChevronLeftIcon />
                  Previous
                </button>
                <span className="text-slate-600 font-medium">Page {Math.floor(pagination.skip / pagination.limit) + 1}</span>
                <button onClick={handleNextPage} disabled={products.length < pagination.limit} className="flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-200 transition-colors px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-slate-200">
                  Next
                  <ChevronRightIcon />
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
  const placeholderColor = (parseInt(String(product.id).slice(-2), 16) % 360).toString(16).padStart(3, '0');

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="relative">
        <div className="h-48 w-full flex items-center justify-center" style={{ backgroundColor: `#${placeholderColor}20` }}>
          <span className="text-5xl font-bold opacity-30" style={{ color: `#${placeholderColor}` }}>{product.name.charAt(0)}</span>
        </div>
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={() => onEdit(product)} className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white hover:text-indigo-600 rounded-full transition-colors shadow-md">
            <EditIcon />
          </button>
          <button onClick={() => onDelete(product.id)} className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white hover:text-red-600 rounded-full transition-colors shadow-md">
            <DeleteIcon />
          </button>
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 truncate">{product.name}</h3>
          <p className="text-slate-500 mt-1 text-sm h-10 overflow-hidden">{product.description}</p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-2xl font-extrabold text-indigo-600">${product.price.toFixed(2)}</p>
          <p className="text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold">QTY: {product.quantity}</p>
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
  const [formData, setFormData] = useState({
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
      const updatedData: Partial<Product> = {};
      Object.keys(formData).forEach(key => {
        const formKey = key as keyof typeof formData;
        if (formKey !== 'id' && formData[formKey] !== product[formKey as keyof Product]) {
          (updatedData as any)[formKey] = formData[formKey];
        }
      });
      if (Object.keys(updatedData).length > 0) {
        onSave({ ...updatedData, id: formData.id });
      } else {
        onClose(); // Close if no changes were made
      }
    } else {
      if (formData.id === '' || formData.name === '' || formData.description === '' || formData.price === '' || formData.quantity === '') {
        // You might want to show a validation error here
        return;
      }
      onSave(formData as unknown as Product);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isEditMode && <input type="number" name="id" value={formData.id} onChange={handleChange} placeholder="Product ID" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required />}
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required={!isEditMode} />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" rows={3} required={!isEditMode}></textarea>
            <div className="flex gap-4">
              <input type="number" name="price" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required={!isEditMode} />
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required={!isEditMode} />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
