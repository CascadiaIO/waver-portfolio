import { CldImage, CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";

// ---------------------------------------------------------------------------
// Types matching Tiptap/Novel JSONB output
// ---------------------------------------------------------------------------
interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TiptapNode {
  type: string;
  attrs?: Record<string, string | number | null | undefined>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

interface TiptapDoc {
  type: "doc";
  content?: TiptapNode[];
}

// ---------------------------------------------------------------------------
// Inline mark renderer
// ---------------------------------------------------------------------------
function renderMarks(text: string, marks: TiptapMark[] = []): React.ReactNode {
  let node: React.ReactNode = text;
  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        node = <strong key={mark.type}>{node}</strong>;
        break;
      case "italic":
        node = <em key={mark.type}>{node}</em>;
        break;
      case "code":
        node = <code key={mark.type}>{node}</code>;
        break;
      case "link":
        node = (
          <a
            key={mark.type}
            href={String(mark.attrs?.href ?? "#")}
            target="_blank"
            rel="noopener noreferrer">
            {node}
          </a>
        );
        break;
    }
  }
  return node;
}

// ---------------------------------------------------------------------------
// Node renderer
// ---------------------------------------------------------------------------
function renderNode(node: TiptapNode, index: number): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={index}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </p>
      );

    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const children = node.content?.map((child, i) => renderNode(child, i));
      if (level === 1) return <h1 key={index}>{children}</h1>;
      if (level === 2) return <h2 key={index}>{children}</h2>;
      if (level === 3) return <h3 key={index}>{children}</h3>;
      if (level === 4) return <h4 key={index}>{children}</h4>;
      return <h5 key={index}>{children}</h5>;
    }

    case "bulletList":
      return (
        <ul key={index}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={index}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </ol>
      );

    case "listItem":
      return (
        <li key={index}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote key={index}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre key={index}>
          <code>{node.content?.map((child, i) => renderNode(child, i))}</code>
        </pre>
      );

    case "horizontalRule":
      return <hr key={index} />;

    case "hardBreak":
      return <br key={index} />;

    case "text":
      return (
        <span key={index}>{renderMarks(node.text ?? "", node.marks)}</span>
      );

    case "image": {
      const src = String(node.attrs?.src ?? "");
      const alt = String(node.attrs?.alt ?? "");
      // Detect Cloudinary public_id vs plain URL
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const cloudinaryBase = `https://res.cloudinary.com/${cloudName}/`;
      if (src.startsWith(cloudinaryBase)) {
        // Extract public_id from URL (strip base + /image/upload/...)
        const match = src.match(/\/image\/upload\/(?:[^/]+\/)?(.+)$/);
        const publicId = match ? match[1] : src;
        return (
          <div key={index} className="my-4">
            <CldImage
              src={publicId}
              alt={alt}
              width={1200}
              height={800}
              className="rounded-lg w-full h-auto"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
        );
      }
      // Fallback for non-Cloudinary images — render as next/image won't work
      // for arbitrary domains, so use a plain img tag
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          key={index}
          src={src}
          alt={alt}
          className="rounded-lg w-full h-auto my-4"
        />
      );
    }

    case "video": {
      const src = String(node.attrs?.src ?? "");
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const cloudinaryBase = `https://res.cloudinary.com/${cloudName}/`;
      if (src.startsWith(cloudinaryBase)) {
        const match = src.match(/\/video\/upload\/(?:[^/]+\/)?(.+)$/);
        const publicId = match ? match[1] : src;
        return (
          <div key={index} className="my-4">
            <CldVideoPlayer
              id={`video-${index}`}
              src={publicId}
              width={1280}
              height={720}
              className="rounded-lg w-full"
            />
          </div>
        );
      }
      return (
        <video
          key={index}
          src={src}
          controls
          className="rounded-lg w-full my-4"
        />
      );
    }

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------
interface ContentRendererProps {
  content: object;
}

export function ContentRenderer({ content }: ContentRendererProps) {
  const doc = content as TiptapDoc;
  if (!doc?.content?.length) return null;

  return (
    <article className="prose prose-invert prose-zinc lg:prose-xl max-w-none">
      {doc.content.map((node, i) => renderNode(node, i))}
    </article>
  );
}
