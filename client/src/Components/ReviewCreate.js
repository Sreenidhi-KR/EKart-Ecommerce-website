import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ReviewCreate = ({ productId }) => {
  const [content, setContent] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`http://ekart.com/product/${productId}/reviews`, {
        content,
      });
      toast.success("Review Added");
    } catch (err) {
      toast.error("Could not add review");
    }

    setContent("");
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Add Review</label>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-control"
          />
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default ReviewCreate;
