"use client";

import { Category } from "@prisma/client";
import { FcSportsMode } from "react-icons/fc";
import { IconType } from "react-icons/lib";
import { CategoryItem } from "./categories-item";

interface CategoriesProps {
    items: Category[];
}

const iconMap: Record<Category["name"], IconType> = {
    "test1": FcSportsMode,
    "test2": FcSportsMode,
    "test3": FcSportsMode,
    "test4": FcSportsMode,
    "test5": FcSportsMode,
    "test6": FcSportsMode,
    "test7": FcSportsMode,
    "test8": FcSportsMode,           
};

export const Categories = ({
    items,
}: CategoriesProps) => {
    return (
        <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
            {items.map((item) => (
                <CategoryItem 
                key={item.id}
                label={item.name}
                icon={iconMap[item.name]}
                value={item.id}
                />    
            ))}
        </div>
    )

}