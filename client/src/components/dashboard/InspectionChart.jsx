import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const monthlyData = [
  { month: 'Jan', completed: 24, pending: 8 },
  { month: 'Feb', completed: 18, pending: 12 },
  { month: 'Mar', completed: 32, pending: 6 },
  { month: 'Apr', completed: 28, pending: 10 },
  { month: 'May', completed: 35, pending: 5 },
  { month: 'Jun', completed: 42, pending: 8 },
  { month: 'Jul', completed: 38, pending: 7 },
  { month: 'Aug', completed: 45, pending: 9 },
  { month: 'Sep', completed: 40, pending: 6 },
  { month: 'Oct', completed: 48, pending: 4 },
  { month: 'Nov', completed: 52, pending: 5 },
  { month: 'Dec', completed: 55, pending: 3 },
];

const statusData = [
  { name: 'Approved', value: 156, color: 'hsl(142, 76%, 36%)' },
  { name: 'Completed', value: 45, color: 'hsl(217, 91%, 60%)' },
  { name: 'In Progress', value: 28, color: 'hsl(38, 92%, 50%)' },
  { name: 'Pending', value: 12, color: 'hsl(220, 15%, 75%)' },
  { name: 'Rejected', value: 8, color: 'hsl(0, 84%, 60%)' },
];

export const InspectionTrendChart = () => {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h3 className="font-display font-semibold text-lg mb-4">Inspection Trends</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
            <XAxis dataKey="month" stroke="hsl(220, 10%, 45%)" fontSize={12} />
            <YAxis stroke="hsl(220, 10%, 45%)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 15%, 88%)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="hsl(217, 91%, 60%)"
              fillOpacity={1}
              fill="url(#colorCompleted)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="pending"
              stroke="hsl(38, 92%, 50%)"
              fillOpacity={1}
              fill="url(#colorPending)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-sm text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-sm text-muted-foreground">Pending</span>
        </div>
      </div>
    </div>
  );
};

export const InspectionStatusChart = () => {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h3 className="font-display font-semibold text-lg mb-4">Status Distribution</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 15%, 88%)',
                borderRadius: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {statusData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-muted-foreground">{item.name}</span>
            <span className="text-xs font-medium ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
