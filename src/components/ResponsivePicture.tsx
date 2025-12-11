// import type { Picture } from "imagetools-core";

interface Picture {
  sources?: Record<string, string>;
  img: {
    src: string;
    w: number;
    h: number;
  };
}

type SourceLike = Picture | string | { src: string; w?: number; h?: number } | null | undefined;

interface ResponsivePictureProps {
  picture: SourceLike;
  alt: string;
  sizes: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  className?: string;
  imgClassName?: string;
  ariaHidden?: boolean;
}

const isPictureObject = (value: SourceLike): value is Picture =>
  Boolean(value && typeof value === "object" && "img" in value);

const getBasicSrc = (value: SourceLike): { src: string; w?: number; h?: number } | null => {
  if (!value) return null;
  if (typeof value === "string") return { src: value };
  if (isPictureObject(value)) return null;
  if (typeof value === "object" && "src" in value && typeof value.src === "string") {
    return { src: value.src, w: value.w, h: value.h };
  }
  return null;
};

export const ResponsivePicture = ({
  picture,
  alt,
  sizes,
  loading = "lazy",
  decoding = "async",
  className,
  imgClassName,
  ariaHidden,
}: ResponsivePictureProps) => {
  // If imagetools produced full picture data, use it for proper srcset.
  if (isPictureObject(picture) && picture.img) {
    return (
      <picture className={className} aria-hidden={ariaHidden}>
        {Object.entries(picture.sources ?? {}).map(([format, srcset]) => (
          <source key={format} srcSet={srcset} type={`image/${format}`} sizes={sizes} />
        ))}
        <img
          src={picture.img.src}
          width={picture.img.w}
          height={picture.img.h}
          alt={alt}
          loading={loading}
          decoding={decoding}
          className={imgClassName}
          sizes={sizes}
        />
      </picture>
    );
  }

  // Fallback: accept plain string/static import so hero images still render.
  const basic = getBasicSrc(picture);
  if (basic) {
    return (
      <img
        src={basic.src}
        width={basic.w}
        height={basic.h}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={className ? `${className} ${imgClassName ?? ""}` : imgClassName}
      />
    );
  }

  return null;
};
