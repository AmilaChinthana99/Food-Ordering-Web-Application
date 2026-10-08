import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';
import { Plus, Minus, Utensils } from 'lucide-react';

interface FoodItemModalProps {
  item: any;
  restaurant: { id: string; name: string; deliveryFee: number };
  isOpen: boolean;
  onClose: () => void;
}

export const FoodItemModal: React.FC<FoodItemModalProps> = ({
  item,
  restaurant,
  isOpen,
  onClose,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<any>(
    item?.variants && item.variants.length > 0 ? item.variants[0] : null
  );
  const [selectedAddOns, setSelectedAddOns] = useState<any[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  const { addItem, replaceCartAndAdd, restaurantName } = useCartStore();

  if (!item) return null;

  const basePrice = selectedVariant ? selectedVariant.price : item.price;
  const addOnsTotal = selectedAddOns.reduce((acc, a) => acc + a.price, 0);
  const unitPrice = basePrice + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddOnToggle = (addon: any) => {
    if (selectedAddOns.some((a) => a.name === addon.name)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const handleAddToCart = () => {
    const itemPayload = {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      variantName: selectedVariant?.name,
      variantPrice: selectedVariant?.price,
      addOns: selectedAddOns.map((a) => ({ name: a.name, price: a.price })),
      notes,
      image: item.image,
    };

    const success = addItem(restaurant, itemPayload);
    if (success) {
      toast.success(`Added ${quantity}x ${item.name} to cart!`);
      onClose();
    } else {
      setShowConfirmClear(true);
    }
  };

  const handleConfirmReplace = () => {
    const itemPayload = {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      variantName: selectedVariant?.name,
      variantPrice: selectedVariant?.price,
      addOns: selectedAddOns.map((a) => ({ name: a.name, price: a.price })),
      notes,
      image: item.image,
    };

    replaceCartAndAdd(restaurant, itemPayload);
    toast.success(`Cart updated with items from ${restaurant.name}!`);
    setShowConfirmClear(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      {showConfirmClear ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Start new cart?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your cart contains items from <span className="font-semibold text-gray-900 dark:text-white">{restaurantName}</span>.
            Do you want to clear your cart and order from <span className="font-semibold text-primary-500">{restaurant.name}</span> instead?
          </p>
          <div className="flex gap-3 pt-2 justify-center">
            <Button variant="outline" onClick={() => setShowConfirmClear(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmReplace}>
              Clear & Add
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {item.image && (
            <div className="relative h-56 rounded-xl overflow-hidden -mt-2">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex gap-2">
                {item.isVeg ? (
                  <Badge variant="success">Veg</Badge>
                ) : (
                  <Badge variant="danger">Non-Veg</Badge>
                )}
                {item.isPopular && <Badge variant="warning">Popular</Badge>}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{item.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
          </div>

          {/* Variants */}
          {item.variants && item.variants.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Select Option / Portion
              </h4>
              <div className="space-y-2">
                {item.variants.map((variant: any) => (
                  <label
                    key={variant.id || variant.name}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedVariant?.name === variant.name
                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                        : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedVariant?.name === variant.name}
                        onChange={() => setSelectedVariant(variant)}
                        className="text-primary-500 focus:ring-primary-500"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{variant.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Rs. {variant.price.toLocaleString()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {item.addOns && item.addOns.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Add Extra Toppings / Add-ons
              </h4>
              <div className="space-y-2">
                {item.addOns.map((addon: any) => {
                  const isChecked = selectedAddOns.some((a) => a.name === addon.name);
                  return (
                    <label
                      key={addon.id || addon.name}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                          : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleAddOnToggle(addon)}
                          className="rounded text-primary-500 focus:ring-primary-500"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">{addon.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        +Rs. {addon.price.toLocaleString()}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Special Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra spicy, no onions, sauce on the side..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Quantity & Action */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 border border-gray-200 dark:border-slate-800 rounded-xl p-1 bg-gray-50 dark:bg-slate-800">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-gray-900 dark:text-white w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Button variant="primary" size="lg" onClick={handleAddToCart} className="flex-1 ml-4">
              Add to Cart • Rs. {totalPrice.toLocaleString()}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
