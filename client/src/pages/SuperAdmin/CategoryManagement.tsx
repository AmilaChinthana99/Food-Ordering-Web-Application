import React, { useEffect, useState } from 'react';
import { categoryApi } from '../../api/category.api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, Layers } from 'lucide-react';

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    try {
      const res: any = await categoryApi.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setImage('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await categoryApi.update(editingCat.id, { name, image, description });
        toast.success('Category updated!');
      } else {
        await categoryApi.create({ name, image, description });
        toast.success('Category created!');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryApi.delete(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Global Categories</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage global food categories shown on homepage and filters</p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3">
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=150&auto=format&fit=crop'}
                alt={cat.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{cat.name}</h4>
                <p className="text-[10px] text-gray-400">{cat._count?.menuItems || 0} Menu Items</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingCat(cat);
                  setName(cat.name);
                  setImage(cat.image || '');
                  setDescription(cat.description || '');
                  setIsModalOpen(true);
                }}
                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(cat.id)} className="p-2 text-rose-500 hover:text-rose-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCat ? 'Edit Category' : 'New Category'}>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Category Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Image URL" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Save Category
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
