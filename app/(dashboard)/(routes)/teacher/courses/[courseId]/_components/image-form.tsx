"use client";

import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ImageIcon, Pencil, PlusCircle } from "lucide-react";
import { useState, ChangeEvent } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";
import Image from "next/image";

interface ImageFormProps {
    initialData: Course;
    courseId: string;
}

const formSchema = z.object({
    imageUrl: z.string().min(1, {
        message: "Image is required",
    }),
});

export const ImageForm = ({
    initialData,
    courseId
}: ImageFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const onSubmit = async () => {
        if (!file) {
            toast.error("Please select a file");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`/api/courses/${courseId}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success("Course updated");
            toggleEdit();
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        }
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course image
                <Button onClick={toggleEdit} className="bg-transparent hover:bg-gray-100 text-gray-700">
                    {isEditing && (
                        <>Cancel</>
                    )}
                    {!isEditing && !initialData.imageUrl && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-4"/>
                            Add an Image
                        </>
                    )}
                    {!isEditing && initialData.imageUrl && ( 
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit image
                        </>
                    )}    
                </Button>
            </div>
            {!isEditing && (
                !initialData.imageUrl ? (
                    <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                        <ImageIcon className="h-10 w-10 text-slate-500" />
                    </div>
                ) : (
                    <div className="relative aspect-video mt-2">
                        <Image 
                            alt="upload" 
                            fill 
                            className="object-cover rounded-md"
                            src={initialData.imageUrl}
                        />
                    </div>                    
                )
            )}
            {isEditing && (
                <div>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-violet-50 file:text-violet-700
                            hover:file:bg-violet-100
                        "
                    />
                    {file && (
                        <Button onClick={onSubmit} className="mt-2">
                            Upload {file.name}
                        </Button>
                    )}
                    <div className="text-xs text-muted-foreground mt-4">
                        16:9 aspect ratio recommended
                    </div>
                </div>
            )}
        </div>
    )
}