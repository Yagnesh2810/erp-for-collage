//path: frontend\src\components\Dashboard\ProductCategoriesChart.tsx
'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Sector
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

// Fixed interface to ensure consistent typing
interface ProductCategoriesChartProps {
  productData: Array<{name: string; value: number}>;
  isAuthenticated: boolean;
  loading: boolean;
  onRefresh?: () => Promise<void>;
}

// Define consistent colors for categories
const COLORS = {
  'Electronics': '#4F46E5', // Indigo
  'Clothing': '#10B981',    // Emerald
  'Accessories': '#F59E0B', // Amber
  'Home goods': '#EF4444', // Red
  'Other': '#8B5CF6',      // Purple
  // Fallbacks for any other categories
  'default1': '#3B82F6',
  'default2': '#EC4899',
  'default3': '#14B8A6',
  'default4': '#F97316',
};

const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value, name
  } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="text-sm font-medium">
        {name}
      </text>
      <text x={cx} y={cy} dy={0} textAnchor="middle" className="text-base font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <text x={cx} y={cy} dy={20} textAnchor="middle" className="text-xs text-gray-500">
        Value: {value}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

const ProductCategoriesChart: React.FC<ProductCategoriesChartProps> = ({ 
  productData, 
  isAuthenticated,
  loading,
  onRefresh
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Format data to ensure consistent types - ensuring all values are numbers
  const formattedData = productData.map(item => ({
    ...item,
    // Ensure value is a number and not undefined
    value: typeof item.value === 'number' ? item.value : 0
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-sm">{`${data.value}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Get color based on category name
  const getCategoryColor = (categoryName: string) => {
    return COLORS[categoryName as keyof typeof COLORS] || COLORS.default1;
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  return (
    <Card className="col-span-4 md:col-span-3 overflow-hidden transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>
              Distribution by product category
            </CardDescription>
          </div>
          {isAuthenticated && onRefresh && (
            <button 
              onClick={handleRefresh} 
              className="p-1 rounded-full hover:bg-gray-100"
              disabled={refreshing || loading}
            >
              <RefreshCw className={`h-5 w-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton className="h-[300px] w-[300px] max-w-full rounded-full mx-auto" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  animationDuration={800}
                  animationBegin={300}
                >
                  {formattedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getCategoryColor(entry.name)}
                      stroke="white"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{ 
                    paddingLeft: '20px',
                    fontSize: '12px',
                    lineHeight: '20px'
                  }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCategoriesChart;