/** @format */

import React, { useState } from "react";

const QuantityButton = ({ maxStock, updateStock }) => {
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => {
    if (quantity < maxStock) {
      updateStock(quantity + 1);
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      updateStock(quantity - 1);

      setQuantity(quantity - 1);
    }
  };

  return (
    <div>
      <button onClick={decrementQuantity}>-</button>
      <span>{quantity}</span>
      <button onClick={incrementQuantity}>+</button>
    </div>
  );
};

export default QuantityButton;