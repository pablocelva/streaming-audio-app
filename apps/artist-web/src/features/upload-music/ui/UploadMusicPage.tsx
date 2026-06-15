import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAlbumRequestSchema } from "@streaming/api-client";
import type { z } from "zod";
import {
  createAlbum,
  getAudioDurationSeconds,
  uploadSong,
} from "@/shared/api";

type AlbumForm = z.infer<typeof createAlbumRequestSchema>;

type UploadedSong = {
  id: string;
  title: string;
  durationSeconds: number;
};

export function UploadMusicPage() {
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [uploadedSongs, setUploadedSongs] = useState<UploadedSong[]>([]);
  const [songTitle, setSongTitle] = useState("");
  const [songFile, setSongFile] = useState<File | null>(null);
  const [albumError, setAlbumError] = useState<string | null>(null);
  const [songError, setSongError] = useState<string | null>(null);
  const [isUploadingSong, setIsUploadingSong] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AlbumForm>({ resolver: zodResolver(createAlbumRequestSchema) });

  const onCreateAlbum = handleSubmit(async (values) => {
    setAlbumError(null);
    try {
      const album = await createAlbum(values);
      setAlbumId(album.id);
      setUploadedSongs([]);
    } catch {
      setAlbumError("No se pudo crear el álbum.");
    }
  });

  const onUploadSong = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!albumId || !songFile || !songTitle.trim()) {
      setSongError("Completa título y archivo de audio.");
      return;
    }

    setSongError(null);
    setIsUploadingSong(true);
    try {
      const durationSeconds = await getAudioDurationSeconds(songFile);
      const song = await uploadSong(
        albumId,
        songFile,
        songTitle.trim(),
        durationSeconds,
        uploadedSongs.length + 1,
      );
      setUploadedSongs((prev) => [
        ...prev,
        { id: song.id, title: song.title, durationSeconds: song.durationSeconds },
      ]);
      setSongTitle("");
      setSongFile(null);
    } catch {
      setSongError("No se pudo subir la canción. Revisa el archivo e inténtalo de nuevo.");
    } finally {
      setIsUploadingSong(false);
    }
  };

  return (
    <section className="panel">
      <h2>Subir música</h2>

      {!albumId ? (
        <form onSubmit={onCreateAlbum} className="stack">
          <h3>1. Crear álbum</h3>
          <label>
            Título del álbum
            <input {...register("title")} />
            {errors.title && <span className="error">{errors.title.message}</span>}
          </label>
          <label>
            Año de lanzamiento (opcional)
            <input type="number" {...register("releaseYear", { valueAsNumber: true })} />
          </label>
          <label>
            Género (opcional)
            <input {...register("genre")} />
          </label>
          {albumError && <p className="error">{albumError}</p>}
          <button type="submit" disabled={isSubmitting}>
            Crear álbum
          </button>
        </form>
      ) : (
        <div className="stack">
          <p className="muted">Álbum creado. ID: {albumId}</p>

          <form onSubmit={onUploadSong} className="stack">
            <h3>2. Subir canciones</h3>
            <label>
              Título de la canción
              <input
                value={songTitle}
                onChange={(event) => setSongTitle(event.target.value)}
              />
            </label>
            <label>
              Archivo de audio
              <input
                type="file"
                accept="audio/*"
                onChange={(event) => setSongFile(event.target.files?.[0] ?? null)}
              />
            </label>
            {songError && <p className="error">{songError}</p>}
            <button type="submit" disabled={isUploadingSong}>
              Subir canción
            </button>
          </form>

          {uploadedSongs.length > 0 && (
            <div>
              <h3>Canciones subidas</h3>
              <ul>
                {uploadedSongs.map((song) => (
                  <li key={song.id}>
                    {song.title} — {song.durationSeconds}s
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
