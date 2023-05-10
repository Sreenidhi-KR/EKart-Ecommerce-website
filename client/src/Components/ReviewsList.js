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

    return <li key={review.reviewId}>{content}</li>;
  });

  return (
    <ul>
      {renderedReviews?.length > 0 ? renderedReviews : <h6> No Reviews</h6>}
    </ul>
  );
};

export default ReviewsList;
