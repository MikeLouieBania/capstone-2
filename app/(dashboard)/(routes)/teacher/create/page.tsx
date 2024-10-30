"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { 
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormLabel,
    FormMessage,
    FormItem,
 } from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
//import { Ghost } from "lucide-react";
import toast from "react-hot-toast";


const formSchema = z.object({
    title: z.string().min(1, {
        message: "Title is Required",
    }),

});

const CreatePage = () => {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: ""
        },
    });

    const { isSubmitting, isValid } = form.formState;
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await axios.post("/api/courses", values);
            // Use backticks for the template literal here:
            router.push(`/teacher/courses/${response.data.id}`);
            toast.success("Course Added");
        } catch { 
            toast.error("Something went wrong");
        }
    };
    
    
    return(
        <div className="max-w-5xl mx-auto flex md:items-center
        md:justify-center h-full p-6">
            <div>
                <h1 className="text-2xl">
                    Name your Course!
                </h1>
                <p className="twxt-sm text-slate-600">
                    What would you like to name your Course
                </p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 mt-8">
                    <FormField 
                    control={form.control}
                    name="title"
                    render={({ field }) =>(
                        <FormItem>
                            <FormLabel>
                                Course Title
                            </FormLabel>
                            <FormControl>
                                <Input 
                                    disabled={isSubmitting}
                                    placeholder="e.g 'Dribbling'"
                                    {...field}
                                    />
                            </FormControl>
                            <FormDescription>
                                What will you Teach in this Training?
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                        <div className="flex items-center gap-x-2">
                            <Link href="/">
                                <Button type="button" 
                                        className="bg-transparent text-gray-700 hover:bg-gray-100">
                                Cancel
                                </Button>
                            </Link>
                                <Button type="submit" disabled={!isValid || isSubmitting}>
                                Submit
                                </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>

    )
} 

export default CreatePage;