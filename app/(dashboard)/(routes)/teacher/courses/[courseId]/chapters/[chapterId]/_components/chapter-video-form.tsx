"use client";

import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Video } from "lucide-react";
import { useState, ChangeEvent } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chapter } from "@prisma/client";

interface ChapterVideoFormProps {
    initialData: Chapter;
    courseId: string;
    chapterId: string;
}

const formSchema = z.object({
    videoUrl: z.string().min(1),
});

export const ChapterVideoForm = ({
    initialData,
    courseId,
    chapterId,
}: ChapterVideoFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const onSubmit = async () => {
        if (!file) {
            toast.error("Please select a video file");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('videoFile', file);

            const response = await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/video`, formData);

            toast.success("Video uploaded successfully");
            toggleEdit();
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong while uploading the video");
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Chapter video
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && (
                        <>Cancel</>
                    )}
                    {!isEditing && !initialData.videoUrl && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2"/>
                            Add a video
                        </>
                    )}
                    {!isEditing && initialData.videoUrl && ( 
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit video
                        </>
                    )}    
                </Button>
            </div>
            {!isEditing && (
                !initialData.videoUrl ? (
                    <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                        <Video className="h-10 w-10 text-slate-500" />
                    </div>
                ) : (
                    <div className="relative aspect-video mt-2">
                        <video 
                            src={`/api/courses/${courseId}/chapters/${chapterId}/video`}
                            controls 
                            className="w-full h-full"
                        />
                    </div>                    
                )
            )}
            {isEditing && (
                <div>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="video/*"
                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-violet-50 file:text-violet-700
                            hover:file:bg-violet-100
                        "
                    />
                    <Button 
                        onClick={onSubmit} 
                        disabled={!file || isUploading}
                        className="mt-2"
                    >
                        {isUploading ? "Uploading..." : `Upload ${file?.name || "video"}`}
                    </Button>
                    <div className="text-xs text-muted-foreground mt-4">
                        Upload chapter video
                    </div>
                </div>
            )}
            {initialData.videoUrl && !isEditing && (
                <div className="text-xs text-muted-foreground mt-2">
                    Video uploaded successfully. You can preview it above.
                </div>
            )}
        </div>
    )
}