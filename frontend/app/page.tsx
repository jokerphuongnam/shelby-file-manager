import dynamic from "next/dynamic";

const UploadForm = dynamic(
  () => import("@/components/UploadForm").then((m) => ({ default: m.UploadForm })),
  { ssr: false }
);

const FileList = dynamic(
  () => import("@/components/FileList").then((m) => ({ default: m.FileList })),
  { ssr: false }
);

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          File Manager
        </h1>
        <p className="mt-1 text-gray-500">
          Upload, browse, and download files stored on the Shelby Protocol.
        </p>
      </div>

      <UploadForm />
      <FileList />
    </div>
  );
}
