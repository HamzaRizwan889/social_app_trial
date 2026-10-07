interface CloudinaryUploadResponse {
  secure_url: string;
}

export async function uploadImage(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) throw new Error("Image upload is not configured");

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", preset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  if (!response.ok) throw new Error("Image upload failed. Please try again");

  const data = (await response.json()) as CloudinaryUploadResponse;
  return data.secure_url;
}