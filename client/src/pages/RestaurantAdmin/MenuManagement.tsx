import React, { useEffect, useState } from 'react';
import { menuApi } from '../../api/menu.api';
import { categoryApi } from '../../api/category.api';
import { uploadApi } from '../../api/user.api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Upload, Utensils } from 'lucide-react';

export const MenuManagement: React.FC = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants && user.restaurants.length > 0 ? user.restaurants[0].id : '';

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit/Create Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
    isVeg: false,
    isPopular: false,
  });

  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const fetchMenu = async () => {
    if (!restaurantId) return;
    try {
      const [menuRes, catRes]: any[] = await Promise.all([
        menuApi.getMenuItems({ restaurantId }),
        categoryApi.getCategories(),
      ]);

      if (menuRes.success) setMenuItems(menuRes.data);
      if (catRes.success) {
        setCategories(catRes.data);
        if (catRes.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load menu items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [restaurantId]);

  const handleToggleAvailability = async (id: string) => {
    try {
      const res: any = await menuApi.toggleAvailability(id);
      if (res.success) {
        toast.success(res.message);
        fetchMenu();
      }
    } catch (err: any) {
      toast.error('Failed to toggle availability');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res: any = await menuApi.delete(id);
      if (res.success) {
        toast.success('Dish deleted successfully');
        fetchMenu();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete dish');
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    try {
      const res: any = await uploadApi.uploadImage(file);
      if (res.success) {
        setFormData({ ...formData, image: res.data.url });
        toast.success('Image uploaded!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      image: '',
      isVeg: false,
      isPopular: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      categoryId: item.categoryId,
      image: item.image || '',
      isVeg: item.isVeg,
      isPopular: item.isPopular,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        restaurantId,
        categoryId: formData.categoryId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
        isVeg: formData.isVeg,
        isPopular: formData.isPopular,
      };

      if (editingItem) {
        await menuApi.update(editingItem.id, payload);
        toast.success('Dish updated successfully!');
      } else {
        await menuApi.create(payload);
        toast.success('New dish added to menu!');
      }

      setIsModalOpen(false);
      fetchMenu();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save menu item');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Menu Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage food items, prices, and availability</p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAddModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Dish
        </Button>
      </div>

      {loading ? (
        <div className="skeleton h-48 w-full rounded-2xl"></div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-4">
          <Utensils className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="font-bold text-gray-700 dark:text-gray-300">No dishes added yet.</p>
          <Button variant="primary" size="sm" onClick={handleOpenAddModal}>Add Your First Dish</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-40 w-full rounded-2xl overflow-hidden bg-gray-100 relative">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {item.isVeg ? <Badge variant="success">Veg</Badge> : <Badge variant="danger">Non-Veg</Badge>}
                    {item.isPopular && <Badge variant="warning">Popular</Badge>}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">{item.name}</h3>
                    <span className="font-extrabold text-sm text-primary-500">Rs. {item.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={() => handleToggleAvailability(item.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold ${
                    item.isAvailable ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  {item.isAvailable ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  <span>{item.isAvailable ? 'Available' : 'Sold Out'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? 'Edit Dish' : 'Add New Dish'}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <Input
              label="Dish Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Cheese Chicken Kottu"
              required
            />

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price (Rs.)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="1250"
                required
              />

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Delicious ingredients..."
                rows={3}
                required
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.isVeg}
                  onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                  className="rounded text-primary-500 focus:ring-primary-500"
                />
                Vegetarian
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded text-primary-500 focus:ring-primary-500"
                />
                Popular Item
              </label>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full pt-3">
              {editingItem ? 'Save Changes' : 'Add Dish to Menu'}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
