"use client";

import { Card } from "@/components/ui/card";

import { 
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
 } from "recharts";

interface ChartProps {
    data: {
        name: string;
        total: number;
        completed: number;
    }[];
}

export const Chart = ({
    data
}: ChartProps) => {
    return (
        <Card>
            <ResponsiveContainer width="100%" height={350} className="mt-10 mb-2">
                <BarChart data={data}>
                    <XAxis 
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Total Users" fill="#0369a1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    )
}