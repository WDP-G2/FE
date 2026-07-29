import { getCloudinaryImageUrl, handleCloudinaryImageError } from '@/utils/cloudinary'

export default function NewsImage({
  src,
  alt = '',
  preset,
  className = '',
  ...imgProps
}) {
  const resolvedSrc = getCloudinaryImageUrl(src, preset)

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={handleCloudinaryImageError}
      {...imgProps}
    />
  )
}
