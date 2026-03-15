import AppShell from "@/components/layout/AppShell";
import AlbumDetailManager from "@/components/album/AlbumDetailManager";

export const metadata = { title: "แก้ไขอัลบั้ม | NBA Tech Engineer" };

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <AlbumDetailManager albumId={id} />
    </AppShell>
  );
}
