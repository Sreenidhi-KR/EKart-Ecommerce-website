import React from "react";

const ReviewsList = ({ reviews }) => {
  const renderedReviews = reviews.map((review) => {
    let content;

    if (review.status === "approved") {
      content = review.content;
    }

    if (review.status === "pending") {
      content = "This comment is awaiting moderation";
    }

    if (review.status === "rejected") {
      content = "This comment has been rejected";
    }

    return <li key={review.id}>{content}</li>;
  });

  return <ul>{renderedReviews}</ul>;
};

export default ReviewsList;
