/** @format */

import React, { useState } from "react";

const QuantityButton = ({ maxStock, updateStock, selcted_quantity = 1 }) => {
  const [quantity, setQuantity] = useState(selcted_quantity);

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
      <h6> Select Quantity</h6>
      <button
        className="btn btn-secondary mr-1 mb-2 px-2 py-0"
        onClick={decrementQuantity}
      >
        -
      </button>
      <span>{quantity}</span>
      <button
        className="btn btn-secondary ml-1 mb-2 px-2 py-0"
        onClick={incrementQuantity}
      >
        +
      </button>
    </div>
  );
};

export default QuantityButton;
