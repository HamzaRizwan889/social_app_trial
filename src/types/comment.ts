export interface StoredComment {
  authorUid: string;
  text: string;
  createdAt: string;
}

export interface CommentWithAuthor extends StoredComment {
  id: string;
  authorName: string;
  authorPhotoURL: string | null;
}