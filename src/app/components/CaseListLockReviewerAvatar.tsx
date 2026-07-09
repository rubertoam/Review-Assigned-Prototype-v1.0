/** Reviewer headshot shown on a case-list row when another analyst holds the lock. */
export function CaseListLockReviewerAvatar({
  imageUrl,
  reviewerName,
}: {
  imageUrl: string;
  reviewerName: string;
}) {
  return (
    <img
      src={imageUrl}
      alt=""
      title={`In review by ${reviewerName}`}
      className="size-8 shrink-0 rounded-full object-cover"
    />
  );
}
