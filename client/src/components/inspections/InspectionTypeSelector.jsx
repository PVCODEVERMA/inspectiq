import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InspectionTypeCard } from './InspectionTypeCard';
import { ClipboardCheck, Wrench, Building2, Zap } from 'lucide-react';

export const InspectionTypeSelector = ({
  selectedType,
  onSelect,
}) => {
  const navigate = useNavigate();

  const inspectionTypes = [
    {
      id: 'third-party',
      title: 'Third Party Inspection',
      description: 'Pre-shipment, Engineering & Vendor audits',
      icon: ClipboardCheck,
      gradient: 'from-primary/10 to-primary/5',
      route: '/inspections/new',
    },
    {
      id: 'lifts',
      title: 'Lifts Inspection',
      description: 'Elevator & lift safety compliance',
      icon: Building2,
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      route: '/inspections/lifts/new',
    },
    {
      id: 'service',
      title: 'New Service',
      description: 'Create a new maintenance or service request',
      icon: Zap,
      gradient: 'from-amber-500/10 to-amber-500/5',
      route: '/services/new',
    },
  ];

  const handleSelect = (type, route) => {
    if (onSelect) {
      onSelect(type);
    }
    navigate(route);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {inspectionTypes.map((type) => (
        <InspectionTypeCard
          key={type.id}
          title={type.title}
          description={type.description}
          icon={type.icon}
          gradient={type.gradient}
          isActive={selectedType === type.id}
          onClick={() => handleSelect(type.id, type.route)}
        />
      ))}
    </div>
  );
};
