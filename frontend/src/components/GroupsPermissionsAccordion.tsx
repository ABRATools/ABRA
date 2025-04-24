import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface Permission {
  id: number;
  name: string;
  description: string | null;
}

interface GroupPermissionsAccordionProps {
  groupName: string;
  permissions: Permission[];
  onRemovePermission: (permissionId: number) => void;
}

const GroupPermissionsAccordion: React.FC<GroupPermissionsAccordionProps> = ({
  groupName,
  permissions,
  onRemovePermission
}) => {
  if (permissions.length === 0) {
    return <span className="text-muted-foreground">No permissions</span>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="permissions">
        <AccordionTrigger className="py-2">
          <span className="text-sm font-medium">{permissions.length} Permissions</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 pt-1">
            {permissions.map(permission => (
              <div key={permission.id} className="flex items-center justify-between bg-slate-50 rounded p-2">
                <div>
                  <div className="text-sm font-medium">{permission.name}</div>
                  {permission.description && (
                    <div className="text-xs text-muted-foreground">{permission.description}</div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onRemovePermission(permission.id)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default GroupPermissionsAccordion;