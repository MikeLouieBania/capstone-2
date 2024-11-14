"use client";

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

export const ImageForm = ({
    initialData,
    courseId
}: ImageFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [file, setFile] = useState<File | null>(null);

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

            await axios.post(`/api/courses/${courseId}/image`, formData);

            toast.success("Course image updated");
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course image
                <Button onClick={() => setIsEditing(!isEditing)} variant="ghost">
                    {isEditing ? "Cancel" : (
                        <>
                            {initialData.imageUrl ? (
                                <>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit image
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add an image
                                </>
                            )}
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
                            alt="Course image" 
                            fill 
                            className="object-cover rounded-md"
                            src={`/api/courses/${courseId}/image?v=${Date.now()}`}
                        />
                    </div>                    
                )
            )}
            {isEditing && (
                <div>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
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
                </div>
            )}
        </div>
    )
}