export const AreYouSureDelete = (itemName: string, recoverable = true) => {
  return `You are about to delete ${itemName}.  ${recoverable ? 'Once deleted, they can be only be recovered by reaching out to help@getplacez.com.' : ''}`;
};

export const AreYouSurePermanentDelete = (message: string) => {
  return `You are about to delete ${message}. Once deleted they cannot be recovered.`;
}

export const DeleteFavourites = 'Are you sure you want to remove this object from your list of Favorites?';
